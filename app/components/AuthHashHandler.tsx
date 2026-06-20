"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../utils/supabase/client";

/**
 * Supabase auth errors sometimes land on the site root (/) in query or hash.
 * Forward them to the forgot-password page with a readable message.
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
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            router.replace(`/forgot-password?error=${encodeURIComponent(error.message)}`);
            return;
          }
          window.history.replaceState(null, "", "/reset-password?recovery=1");
          router.replace("/reset-password?recovery=1");
        });
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

    const code = searchParams.get("code") || hashParams.get("code");

    if (code) {
      const next = searchParams.get("next") || "/reset-password?recovery=1";
      router.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
      return;
    }

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
