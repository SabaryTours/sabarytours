"use client";

import { useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { trackEvent } from "../lib/analytics";

// Tawk.to API types
declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      onLoad?: () => void;
      onChatStarted?: () => void;
      onChatEnded?: () => void;
      onOfflineSubmit?: () => void;
      setAttributes?: (
        attributes: Record<string, string>,
        callback?: (error?: unknown) => void
      ) => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

function scheduleMinimize() {
  const run = () => {
    try {
      window.Tawk_API?.minimize?.();
    } catch {
      /* ignore */
    }
  };
  // Defer so Tawk finishes layout; matches their recommended pattern
  window.setTimeout(run, 1);
}

export default function TawkToChat() {
  useEffect(() => {
    const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_TO_PROPERTY_ID;
    const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_TO_WIDGET_ID;

    if (!tawkPropertyId || !tawkWidgetId) {
      console.warn(
        "Tawk.to property ID or widget ID is not configured. Please add NEXT_PUBLIC_TAWK_TO_PROPERTY_ID and NEXT_PUBLIC_TAWK_TO_WIDGET_ID to your .env.local file"
      );
      return;
    }

    const src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    const supabase = createClient();

    function identifyVisitor() {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user || typeof window.Tawk_API?.setAttributes !== "function") return;
        const metaName = [user.user_metadata?.first_name, user.user_metadata?.last_name]
          .filter(Boolean)
          .join(" ");
        window.Tawk_API.setAttributes(
          {
            name: metaName || user.email || "",
            email: user.email || "",
          },
          () => {
            /* ignore errors — non-critical */
          }
        );
      });
    }

    window.Tawk_API = window.Tawk_API || {};
    const api = window.Tawk_API;

    const previousOnLoad = typeof api.onLoad === "function" ? api.onLoad : undefined;
    api.onLoad = function () {
      previousOnLoad?.();
      scheduleMinimize();
      identifyVisitor();
    };

    api.onChatStarted = function () {
      trackEvent("chat_started", { chat_provider: "tawkto" });
    };
    api.onChatEnded = function () {
      trackEvent("chat_ended", { chat_provider: "tawkto" });
    };
    api.onOfflineSubmit = function () {
      trackEvent("chat_offline_form_submit", { chat_provider: "tawkto" });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        identifyVisitor();
      }
    });

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existingScript) {
      // Widget already injected (SPA / remount) — onLoad may have fired; nudge closed
      scheduleMinimize();
      identifyVisitor();
      const t1 = window.setTimeout(scheduleMinimize, 400);
      const t2 = window.setTimeout(scheduleMinimize, 1500);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        subscription.unsubscribe();
      };
    }

    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    return () => {
      // Tawk persists; no script removal
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
