import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "../../lib/rateLimit";
import { contactFormSchema } from "../../lib/validations/contact";
import { sendInquiryAdminNotification } from "../../lib/sendInquiryAdminNotification";
import { resend, FROM_EMAIL, INFO_NOTIFY_EMAIL } from "../../lib/resend";
import { escapeHtml } from "../../lib/bookingReceiptEmailHtml";
import { buildEmailHtml } from "../../lib/emailTemplate";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function buildContactAutoReplyHtml(name: string, subject: string): string {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Hi <strong>${escapeHtml(name)}</strong>, thank you for contacting Sabary Tours.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      We received your message regarding <strong>${escapeHtml(subject)}</strong> and will respond as soon as possible — usually within one business day.
    </p>
    <p style="margin:0;font-size:14px;color:#6b7280;">
      For urgent booking help, you can also reach us at
      <a href="mailto:bookings@sabarytours.com" style="color:#ff5e00;font-weight:700;text-decoration:none;">bookings@sabarytours.com</a>.
    </p>
  `;

  return buildEmailHtml({
    documentType: "Message Received",
    metaRows: [{ label: "Subject", value: escapeHtml(subject) }],
    body,
  });
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { ok } = rateLimit({ key: `contact:${ip}`, limit: 10, windowMs: 60_000 });
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

    await supabaseAdmin.from("newsletter_subscribers").upsert(
      {
        email: data.email.toLowerCase(),
        first_name: data.firstName,
        last_name: data.lastName,
        source: "contact_form",
        status: "subscribed",
      },
      { onConflict: "email" },
    );

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
      subject: `We received your message — ${data.subject}`,
      html: buildContactAutoReplyHtml(data.firstName, data.subject),
    });
    if (autoReplyError) {
      console.error("[Resend] Contact auto-reply failed:", autoReplyError);
    }

    return NextResponse.json(
      {
        message:
          "Thank you! Your message has been sent. We'll get back to you at the email address you provided.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please email info@sabarytours.com." },
      { status: 500 },
    );
  }
}
