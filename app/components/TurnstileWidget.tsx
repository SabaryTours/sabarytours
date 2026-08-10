"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          action?: string;
          cData?: string;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onTokenChange: (token: string) => void;
  action?: string;
}

export default function TurnstileWidget({ onTokenChange, action = "form_submit" }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
  const containerId = `turnstile-${useId().replace(/:/g, "-")}`;

  useEffect(() => {
    if (!scriptLoaded || !window.turnstile || !containerRef.current || !siteKey || widgetId) {
      return;
    }

    const id = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onTokenChange(token),
      "expired-callback": () => onTokenChange(""),
      "error-callback": () => onTokenChange(""),
      action,
      theme: "light",
    });
    setWidgetId(id);
  }, [action, scriptLoaded, siteKey, widgetId, onTokenChange]);

  useEffect(() => {
    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.reset(widgetId);
      }
    };
  }, [widgetId]);

  if (!siteKey) {
    return (
      <p className="text-sm text-red-600">
        CAPTCHA is not configured. Please set `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div id={containerId} ref={containerRef} />
    </div>
  );
}
