"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  detectClickLocation,
  detectOutboundPlatform,
  getPageType,
  trackCtaClick,
  trackOutboundClick,
  trackPhoneClick,
  trackScrollDepth,
  trackTimeOnPage,
  trackWhatsAppClick,
  type CtaIntent,
} from "../lib/analytics";

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

function isWhatsAppHref(href: string): boolean {
  const lower = href.toLowerCase();
  return lower.includes("wa.me") || lower.includes("whatsapp.com") || lower.includes("whatsapp");
}

/**
 * Site-wide analytics: auto phone/WhatsApp/social clicks, scroll depth, time on page,
 * and data-analytics-* CTA tags. Events go to dataLayer (GTM) + gtag (GA4).
 */
export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrollFiredRef = useRef<Set<number>>(new Set());
  const pageStartRef = useRef<number>(0);
  const pageTypeRef = useRef<string>("other");

  useEffect(() => {
    pageTypeRef.current = getPageType(pathname);
    pageStartRef.current = Date.now();
    scrollFiredRef.current = new Set();

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      if (scrollHeight <= 0) return;

      const percent = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !scrollFiredRef.current.has(milestone)) {
          scrollFiredRef.current.add(milestone);
          trackScrollDepth(milestone, pageTypeRef.current);
        }
      }
    };

    const flushTimeOnPage = () => {
      const seconds = (Date.now() - pageStartRef.current) / 1000;
      if (seconds >= 3) {
        trackTimeOnPage(seconds, pageTypeRef.current);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flushTimeOnPage);

    return () => {
      flushTimeOnPage();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flushTimeOnPage);
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      const button = target.closest("button[data-analytics-cta]") as HTMLButtonElement | null;
      const location = detectClickLocation(target);

      if (button?.dataset.analyticsCta) {
        trackCtaClick(
          button.dataset.analyticsCta as CtaIntent,
          button.dataset.analyticsLocation || location,
          button.textContent?.trim() || undefined,
        );
        return;
      }

      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";

      const dataCta = anchor.dataset.analyticsCta as CtaIntent | undefined;
      if (dataCta) {
        trackCtaClick(dataCta, anchor.dataset.analyticsLocation || location, anchor.textContent?.trim());
      }

      if (href.startsWith("tel:")) {
        trackPhoneClick(anchor.dataset.analyticsLocation || location, href.replace("tel:", ""));
        return;
      }

      if (isWhatsAppHref(href)) {
        trackWhatsAppClick(anchor.dataset.analyticsLocation || location, href);
        return;
      }

      if (href.startsWith("http")) {
        const platform = detectOutboundPlatform(href);
        if (platform && platform !== "whatsapp") {
          trackOutboundClick(platform, href, anchor.dataset.analyticsLocation || location);
        }
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return <>{children}</>;
}
