"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
          theme: "light" | "dark";
        },
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

export default function ReCaptchaWidget({ onTokenChange }: { onTokenChange: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!scriptLoaded || !siteKey || !window.grecaptcha || !containerRef.current || widgetIdRef.current !== null) return;

    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: onTokenChange,
      "expired-callback": () => onTokenChange(""),
      "error-callback": () => onTokenChange(""),
      theme: "light",
    });
  }, [onTokenChange, scriptLoaded, siteKey]);

  if (!siteKey) {
    return <p className="text-sm text-amber-700">Spam protection is being configured. You can still send your message.</p>;
  }

  return (
    <div className="space-y-2">
      <Script
        id="google-recaptcha-v2"
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
        onError={() => onTokenChange("")}
      />
      <div ref={containerRef} />
    </div>
  );
}