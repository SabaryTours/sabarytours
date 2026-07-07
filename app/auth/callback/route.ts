import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";
import {
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RESET_PATH,
  RECOVERY_COOKIE_OPTIONS,
} from "../../lib/passwordRecovery";

const HASH_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Verifying reset link</title>
</head>
<body>
  <p>Verifying your reset link…</p>
  <script>
    (function () {
      var hash = window.location.hash.slice(1);
      if (hash) {
        var params = new URLSearchParams(hash);
        var error = params.get("error_description") || params.get("error");
        if (error) {
          window.location.replace("/forgot-password?error=" + encodeURIComponent(error));
          return;
        }
        var accessToken = params.get("access_token");
        var refreshToken = params.get("refresh_token");
        var type = params.get("type");
        if (accessToken && refreshToken && type === "recovery") {
          window.location.replace("/reset-password?recovery=1" + window.location.hash);
          return;
        }
      }
      // No code in query, no tokens in hash — link is invalid or already used
      window.location.replace("/forgot-password?error=missing_code");
    })();
  </script>
</body>
</html>`;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");
  const next = url.searchParams.get("next") || PASSWORD_RESET_PATH;
  const origin = url.origin;

  // Handle error redirects from Supabase
  if (errorParam || errorDesc) {
    const msg = errorDesc || errorParam || "Invalid or expired link";
    const isExpired =
      /expired|otp_expired/i.test(msg) ||
      errorParam === "otp_expired";
    const friendlyMsg = isExpired
      ? "expired"
      : msg;
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(friendlyMsg)}`
    );
  }

  // No code — serve HTML that checks for hash-fragment tokens (legacy flow)
  if (!code) {
    return new NextResponse(HASH_FALLBACK_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = await createClient();

  // Clear any existing session so recovery does not silently keep the old user.
  await supabase.auth.signOut();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    const isExpired =
      /expired|invalid|already.*used|otp_expired/i.test(error.message);
    const friendlyMsg = isExpired
      ? "That reset link has expired or was already used. Please request a new one."
      : error.message;
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(friendlyMsg)}`,
    );
  }

  const safeNext = next.startsWith("/") ? next : PASSWORD_RESET_PATH;
  const response = NextResponse.redirect(`${origin}${safeNext}`);
  response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", RECOVERY_COOKIE_OPTIONS);
  return response;
}
