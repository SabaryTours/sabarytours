import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "../../lib/rateLimit";
import { contactFormSchema } from "../../lib/validations/contact";
import { sendInquiryAdminNotification } from "../../lib/sendInquiryAdminNotification";
import { resend, FROM_EMAIL, INFO_NOTIFY_EMAIL } from "../../lib/resend";
import {
  buildContactAutoReplyHtml,
  CONTACT_SUCCESS_MESSAGE,
} from "../../lib/inquiryEmailHtml";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type ReCaptchaResponse = { success?: boolean; hostname?: string; "error-codes"?: string[] };

async function verifyReCaptcha(token: string, ip: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token) return false;
  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", token);
  if (ip !== "unknown") formData.set("remoteip", ip);
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });
  if (!response.ok) return false;
  const result = (await response.json()) as ReCaptchaResponse;
  return result.success === true;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { ok } = rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 10 * 60_000 });
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    if (!process.env.RESEND_API_KEY?.trim()) {
      console.error("RESEND_API_KEY is missing");
      return NextResponse.json(
        { error: "Email service is not configured. Please email us directly at info@sabarytours.com." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const captchaToken = typeof body?.captchaToken === "string" ? body.captchaToken : "";
    const honeypot = typeof body?.website === "string" ? body.website.trim() : "";
    const formStartedAt = typeof body?.formStartedAt === "number" ? body.formStartedAt : 0;
    if (honeypot || !formStartedAt || Date.now() - formStartedAt < 2_000) {
      return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
    }
    if (!(await verifyReCaptcha(captchaToken, ip))) {
      return NextResponse.json({ error: "Security check failed or expired. Please refresh and try again." }, { status: 400 });
    }
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid form data";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const data = parsed.data;
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const { error: insertError } = await supabaseAdmin.from("inquiries").insert([
      {
        name: fullName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        type: "general",
        status: "new",
      },
    ]);

    if (insertError) {
      console.error("Contact inquiry insert error:", insertError);
      return NextResponse.json(
        { error: "We could not save your message. Please try again or email info@sabarytours.com." },
        { status: 500 },
      );
    }

    await sendInquiryAdminNotification(
      {
        source: "contact",
        name: fullName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      },
      { to: INFO_NOTIFY_EMAIL },
    );

    const { error: autoReplyError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.email],
      subject: "Thank you for contacting Sabary Tours",
      html: buildContactAutoReplyHtml(data.firstName),
    });
    if (autoReplyError) {
      console.error("[Resend] Contact auto-reply failed:", autoReplyError);
    }

    return NextResponse.json({ message: CONTACT_SUCCESS_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please email info@sabarytours.com." },
      { status: 500 },
    );
  }
}
