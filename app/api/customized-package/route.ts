import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "../../lib/rateLimit";
import {
  customizedPackageSchema,
  firstCustomizedPackageValidationMessage,
  formatCustomizedPackageMessage,
} from "../../lib/validations/customizedPackage";
import { sendInquiryAdminNotification } from "../../lib/sendInquiryAdminNotification";
import { resend, FROM_EMAIL } from "../../lib/resend";
import { upsertNewsletterSubscriber } from "../../lib/newsletterSubscribe";
import {
  buildCustomizedTripAutoReplyHtml,
  CUSTOMIZED_TRIP_SUCCESS_MESSAGE,
} from "../../lib/inquiryEmailHtml";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { ok } = rateLimit({ key: `customized:${ip}`, limit: 5, windowMs: 60_000 });
    if (!ok) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = customizedPackageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: firstCustomizedPackageValidationMessage(parsed.error),
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const message = formatCustomizedPackageMessage(data);

    const { error } = await supabaseAdmin.from("inquiries").insert([
      {
        name: fullName,
        email: data.email,
        phone: data.phone,
        subject: `Customized package — ${data.organisationOrIndividual}`,
        message,
        type: "customized_package",
        status: "new",
      },
    ]);

    if (error) {
      console.error("Customized package inquiry error:", error);
      return NextResponse.json(
        { error: "Failed to submit request. Please try again." },
        { status: 500 },
      );
    }

    let newsletterNote: string | undefined;
    if (data.subscribeNewsletter) {
      const sub = await upsertNewsletterSubscriber(supabaseAdmin, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        source: "customized_package_form",
      });
      if (!sub.ok) {
        newsletterNote =
          " Your trip request was saved, but we could not add you to the newsletter — you can subscribe from the footer anytime.";
        console.error("[customized-package] newsletter:", sub.error);
      }
    }

    await sendInquiryAdminNotification({
      source: "customized_package",
      name: fullName,
      email: data.email,
      phone: data.phone,
      subject: `Customized package — ${data.organisationOrIndividual}`,
      message,
    });

    if (process.env.RESEND_API_KEY?.trim()) {
      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.email],
        subject: "We've received your customized tour request — Sabary Tours",
        html: buildCustomizedTripAutoReplyHtml(data.firstName),
      });
      if (emailError) {
        console.error("[Resend] Customized trip auto-reply failed:", emailError);
      }
    }

    return NextResponse.json({
      message: CUSTOMIZED_TRIP_SUCCESS_MESSAGE + (newsletterNote ?? ""),
    });
  } catch (err) {
    console.error("Customized package API error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
