"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Supabase auth errors sometimes land on the site root (/) in query or hash.
 * Forward them to the forgot-password page with a readable message.
 */
export default function AuthHashHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== "/") return;

    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    const hashParams = new URLSearchParams(hash);

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
      const next = searchParams.get("next") || "/reset-password";
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
