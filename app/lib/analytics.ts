/**
 * Pushes conversion & engagement events to GTM (dataLayer) and GA4 (gtag).
 * Configure GTM triggers on the `event` name — no PII is sent.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type CtaIntent =
  | "book_now"
  | "get_quote"
  | "book_call"
  | "download_brochure"
  | "whatsapp"
  | "phone"
  | "contact_submit"
  | "custom_trip_submit";

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

function getPagePath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname + window.location.search;
}

/** Core push — works with GTM Custom Event triggers and direct GA4. */
export function trackEvent(eventName: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined") return;

  const payload = {
    event: eventName,
    page_path: getPagePath(),
    page_title: typeof document !== "undefined" ? document.title : undefined,
    ...params,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (typeof window.gtag === "function") {
    const { event: _e, ...gaParams } = payload;
    window.gtag("event", eventName, gaParams);
  }
}

export function trackCtaClick(intent: CtaIntent, location: string, label?: string): void {
  trackEvent("cta_click", {
    cta_intent: intent,
    cta_location: location,
    cta_label: label,
  });
}

export function trackWhatsAppClick(location: string, linkUrl?: string): void {
  trackEvent("whatsapp_click", {
    cta_location: location,
    link_url: linkUrl,
  });
}

export function trackPhoneClick(location: string, phoneNumber?: string): void {
  trackEvent("phone_click", {
    cta_location: location,
    phone_number: phoneNumber ? phoneNumber.replace(/\s/g, "") : undefined,
  });
}

export function trackOutboundClick(platform: string, linkUrl: string, location: string): void {
  trackEvent("outbound_click", {
    social_platform: platform,
    link_url: linkUrl,
    cta_location: location,
  });
}

export function trackScrollDepth(percent: 25 | 50 | 75 | 100, pageType?: string): void {
  trackEvent("scroll_depth", {
    scroll_percent: percent,
    page_type: pageType,
  });
}

export function trackTimeOnPage(seconds: number, pageType?: string): void {
  let bucket: string;
  if (seconds < 10) bucket = "under_10s";
  else if (seconds < 30) bucket = "10_to_30s";
  else if (seconds < 60) bucket = "30_to_60s";
  else if (seconds < 120) bucket = "1_to_2min";
  else bucket = "over_2min";

  trackEvent("time_on_page", {
    engagement_seconds: Math.round(seconds),
    engagement_bucket: bucket,
    page_type: pageType,
  });
}

export function trackFormStart(formId: string, formName: string): void {
  trackEvent("form_start", { form_id: formId, form_name: formName });
}

export function trackFormSubmit(formId: string, formName: string): void {
  trackEvent("form_submit", { form_id: formId, form_name: formName });
}

export function trackFormAbandon(formId: string, formName: string): void {
  trackEvent("form_abandon", { form_id: formId, form_name: formName });
}

/** Classify page for scroll/time reports. */
export function getPageType(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/packages/") && pathname.split("/").length > 3) return "tour_detail";
  if (pathname.startsWith("/packages")) return "packages";
  if (pathname.startsWith("/booking")) return "booking";
  if (pathname === "/contact") return "contact";
  if (pathname === "/customized-package") return "custom_trip";
  if (pathname.startsWith("/blog/")) return "blog_post";
  if (pathname === "/blog") return "blog";
  return "other";
}

const SOCIAL_HOSTS: Record<string, string> = {
  "facebook.com": "facebook",
  "fb.com": "facebook",
  "instagram.com": "instagram",
  "linkedin.com": "linkedin",
  "twitter.com": "twitter",
  "x.com": "twitter",
  "tiktok.com": "tiktok",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
};

export function detectOutboundPlatform(href: string): string | null {
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    for (const [domain, platform] of Object.entries(SOCIAL_HOSTS)) {
      if (host === domain || host.endsWith(`.${domain}`)) return platform;
    }
    if (host.includes("wa.me") || host.includes("whatsapp")) return "whatsapp";
  } catch {
    /* ignore */
  }
  return null;
}

export function detectClickLocation(el: Element): string {
  const tagged = el.closest("[data-analytics-location]") as HTMLElement | null;
  if (tagged?.dataset.analyticsLocation) return tagged.dataset.analyticsLocation;

  const section = el.closest("header, footer, nav, main, section, form");
  if (section?.id) return section.id;
  if (section instanceof HTMLElement && section.dataset.analyticsLocation) {
    return section.dataset.analyticsLocation;
  }
  if (el.closest("footer")) return "footer";
  if (el.closest("header")) return "header";
  return "page";
}
