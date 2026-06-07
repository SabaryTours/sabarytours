import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { rateLimit } from "../../../lib/rateLimit";
import { upsertNewsletterSubscriber } from "../../../lib/newsletterSubscribe";
import {
  buildNewsletterWelcomeHtml,
  NEWSLETTER_SUCCESS_MESSAGE,
} from "../../../lib/inquiryEmailHtml";
import { resend, FROM_EMAIL } from "../../../lib/resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const subscribeSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  source: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey?.trim()) {
      console.error("[newsletter] Missing Supabase service role configuration");
      return NextResponse.json(
        { error: "Subscription service is not configured. Please try again later." },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { ok } = rateLimit({ key: `newsletter:${ip}`, limit: 15, windowMs: 60_000 });
    if (!ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid email";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, firstName, lastName, source } = parsed.data;
    const result = await upsertNewsletterSubscriber(supabaseAdmin, {
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      source: source || "website_newsletter",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (process.env.RESEND_API_KEY?.trim()) {
      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: "Welcome to Sabary Tours — you're subscribed!",
        html: buildNewsletterWelcomeHtml(),
      });
      if (emailError) {
        console.error("[newsletter] welcome email failed:", emailError);
      }
    } else {
      console.error("[newsletter] RESEND_API_KEY missing — subscriber saved but no welcome email sent");
    }

    return NextResponse.json({ message: NEWSLETTER_SUCCESS_MESSAGE }, { status: 200 });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
