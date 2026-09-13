"use client";

import { useId } from "react";

import type { ReviewPlatform } from "../../lib/reviewSources";

/**
 * Small platform marks for the review badges. Drawn inline so the widget needs
 * no external icon requests (the CSP-free equivalent of the aggregator badges).
 */
export default function PlatformLogo({
  platform,
  size = 16,
}: {
  platform: ReviewPlatform;
  size?: number;
}) {
  // Unique per instance so repeated cards don't collide on the gradient id.
  const gradientId = `ig-grad-${useId()}`;
  const common = {
    width: size,
    height: size,
    "aria-hidden": true as const,
    className: "shrink-0",
  };

  switch (platform) {
    case "google":
      return (
        <svg {...common} viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
          />
          <path
            fill="#EA4335"
            d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
          />
        </svg>
      );

    case "tripadvisor":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#00AA6C" />
          <circle cx="8.2" cy="12" r="3.1" fill="#fff" />
          <circle cx="15.8" cy="12" r="3.1" fill="#fff" />
          <circle cx="8.2" cy="12" r="1.35" fill="#00AA6C" />
          <circle cx="15.8" cy="12" r="1.35" fill="#00AA6C" />
        </svg>
      );

    case "facebook":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#1877F2" />
          <path
            fill="#fff"
            d="M15.1 12.6h-2v6.6h-2.8v-6.6H8.9v-2.4h1.4V8.9c0-1.9 1.1-2.9 2.9-2.9h2.1v2.4h-1.3c-.6 0-.9.3-.9.9v.9h2.3l-.3 2.4z"
          />
        </svg>
      );

    case "instagram":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FDCB5C" />
              <stop offset="45%" stopColor="#E1306C" />
              <stop offset="100%" stopColor="#833AB4" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="22" height="22" rx="6.5" fill={`url(#${gradientId})`} />
          <rect
            x="5.2"
            y="5.2"
            width="13.6"
            height="13.6"
            rx="4.2"
            fill="none"
            stroke="#fff"
            strokeWidth="1.7"
          />
          <circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" strokeWidth="1.7" />
          <circle cx="16.6" cy="7.4" r="1.15" fill="#fff" />
        </svg>
      );

    case "twitter":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#111" />
          <path
            fill="#fff"
            d="M16.9 6.4h-1.9l-3 3.6-2.5-3.6H6l4.3 6L6.2 17.6h1.9l3.2-3.9 2.7 3.9h3.4l-4.5-6.4 3.9-4.8zm-1.2 9.9h-1L8.4 7.6h1.1l6.2 8.7z"
          />
        </svg>
      );

    case "tiktok":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#111" />
          <path
            fill="#25F4EE"
            d="M13.9 5.6c.2 1.6 1.1 2.6 2.6 2.8v1.9c-.9.1-1.7-.1-2.6-.6v3.9c0 2.5-1.9 4.1-4 3.9-1.9-.2-3.2-1.8-3.1-3.7.1-1.9 1.8-3.3 3.7-3.1v2c-.9-.2-1.7.4-1.8 1.2-.1.9.5 1.6 1.4 1.6.8 0 1.4-.6 1.4-1.6V5.6h2.4z"
          />
          <path
            fill="#FE2C55"
            d="M14.6 5.6c.2 1.6 1.1 2.6 2.6 2.8v1.9c-.9.1-1.7-.1-2.6-.6v3.9c0 2.5-1.9 4.1-4 3.9a3.6 3.6 0 0 1-1.5-.5c.5.2 1 .3 1.6.3 2 .1 3.6-1.5 3.6-3.8V9.6c.9.5 1.7.7 2.6.6V8.3c-1.3-.2-2.2-1-2.5-2.4l.2-.3z"
          />
        </svg>
      );

    default:
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#ff5e00" />
          <path
            fill="#fff"
            d="M12 5.2 13.9 9l4.2.6-3 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3-3L9.9 9 12 5.2z"
          />
        </svg>
      );
  }
}
