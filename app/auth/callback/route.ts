import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/reset-password";
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=missing_code`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  const safeNext = next.startsWith("/") ? next : "/reset-password";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
