import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "../../../lib/resend";
import { buildPasswordResetEmailHtml } from "../../../lib/passwordResetEmailHtml";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GENERIC_OK =
  "If an account exists for that email, we sent password reset instructions.";

function siteOrigin(request: Request): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "https://www.sabarytours.com";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY?.trim()) {
      return NextResponse.json(
        {
          error: "email_not_configured",
          message: "Password reset email is not configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "invalid_email", message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const origin = siteOrigin(request);
    const redirectTo = `${origin}/auth/callback?next=/reset-password`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    const actionLink = data?.properties?.action_link;

    if (error || !actionLink) {
      // Do not reveal whether the account exists
      console.warn("[forgot-password] generateLink:", error?.message ?? "no action_link");
      return NextResponse.json({ success: true, message: GENERIC_OK });
    }

    if (!resend) {
      return NextResponse.json(
        {
          error: "email_not_configured",
          message: "Password reset email is not configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Reset your Sabary Tours password",
      html: buildPasswordResetEmailHtml({ resetLink: actionLink, email }),
    });

    if (emailError) {
      console.error("[forgot-password] Resend error:", emailError);
      return NextResponse.json(
        {
          error: "send_failed",
          message: "We could not send the reset email. Please try again in a few minutes.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: GENERIC_OK });
  } catch (e) {
    console.error("[forgot-password]", e);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
