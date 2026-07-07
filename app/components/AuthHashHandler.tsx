"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../utils/supabase/client";
import { PASSWORD_RESET_PATH } from "../lib/passwordRecovery";

async function markRecoveryPending() {
  await fetch("/api/auth/recovery-pending", { method: "POST" });
}

const CODE_HANDLER_PATHS = new Set(["/", "/auth/callback"]);

/**
 * Supabase recovery links may land with a PKCE code (query) or legacy hash tokens.
 * Normalize both into our reset-password flow.
 */
export default function AuthHashHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    const hashParams = new URLSearchParams(hash);

    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    if (accessToken && refreshToken && type === "recovery") {
      const supabase = createClient();
      void supabase.auth.signOut().finally(() => {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(async ({ error }) => {
            if (error) {
              router.replace(`/forgot-password?error=${encodeURIComponent(error.message)}`);
              return;
            }
            await markRecoveryPending();
            window.history.replaceState(null, "", PASSWORD_RESET_PATH);
            router.replace(PASSWORD_RESET_PATH);
          });
      });
      return;
    }

    const code = searchParams.get("code") || hashParams.get("code");
    if (code && pathname && CODE_HANDLER_PATHS.has(pathname)) {
      const next = searchParams.get("next") || PASSWORD_RESET_PATH;
      router.replace(
        `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`
      );
      return;
    }

    if (pathname !== "/") return;

    const errorCode =
      searchParams.get("error_code") ||
      hashParams.get("error_code") ||
      searchParams.get("error") ||
      hashParams.get("error");

    const errorDescription =
      searchParams.get("error_description") ||
      hashParams.get("error_description");

    if (errorCode) {
      const params = new URLSearchParams();
      if (errorCode === "otp_expired" || errorDescription?.includes("expired")) {
        params.set("error", "expired");
      } else {
        params.set("error", errorCode);
      }
      router.replace(`/forgot-password?${params.toString()}`);
    }
  }, [pathname, router, searchParams]);

  return null;
}
