"use client";

import { useEffect } from "react";

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

    window.Tawk_API = window.Tawk_API || {};
    const api = window.Tawk_API;

    const previousOnLoad = typeof api.onLoad === "function" ? api.onLoad : undefined;
    api.onLoad = function () {
      previousOnLoad?.();
      scheduleMinimize();
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existingScript) {
      // Widget already injected (SPA / remount) — onLoad may have fired; nudge closed
      scheduleMinimize();
      const t1 = window.setTimeout(scheduleMinimize, 400);
      const t2 = window.setTimeout(scheduleMinimize, 1500);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
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
    };
  }, []);

  return null;
}
