import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";
import { rateLimit } from "../../lib/rateLimit";
import {
  customizedPackageSchema,
  formatCustomizedPackageMessage,
} from "../../lib/validations/customizedPackage";
import { sendInquiryAdminNotification } from "../../lib/sendInquiryAdminNotification";

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
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = customizedPackageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = await createClient();
    const message = formatCustomizedPackageMessage(data);

    const { error } = await supabase.from("inquiries").insert([
      {
        name: `${data.firstName} ${data.lastName}`.trim(),
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
        { status: 500 }
      );
    }

    if (data.subscribeNewsletter) {
      await supabase.from("newsletter_subscribers").upsert(
        {
          email: data.email.toLowerCase(),
          first_name: data.firstName,
          last_name: data.lastName,
          source: "customized_package_form",
          status: "subscribed",
        },
        { onConflict: "email" }
      );
    }

    await sendInquiryAdminNotification({
      source: "customized_package",
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      phone: data.phone,
      subject: `Customized package — ${data.organisationOrIndividual}`,
      message,
    });

    return NextResponse.json({
      message:
        "Thank you! We received your customized tour request and will be in touch shortly.",
    });
  } catch (err) {
    console.error("Customized package API error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
