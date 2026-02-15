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
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

export default function TawkToChat() {
  useEffect(() => {
    // Tawk.to script loader
    const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_TO_PROPERTY_ID;
    const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_TO_WIDGET_ID;

    if (!tawkPropertyId || !tawkWidgetId) {
      console.warn("Tawk.to property ID or widget ID is not configured. Please add NEXT_PUBLIC_TAWK_TO_PROPERTY_ID and NEXT_PUBLIC_TAWK_TO_WIDGET_ID to your .env.local file");
      return;
    }

    // Check if Tawk.to is already loaded
    if (window.Tawk_API) {
      return;
    }

    // Create and configure the Tawk.to script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    // Initialize Tawk_API
    window.Tawk_API = {};
    window.Tawk_LoadStart = new Date();

    // Insert the script
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    // Cleanup function (optional - Tawk.to persists across navigation)
    return () => {
      // Tawk.to widget persists, so we don't need to remove it
      // But we can hide it if needed during cleanup
    };
  }, []);

  return null; // This component doesn't render anything
}

