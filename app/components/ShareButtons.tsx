"use client";

import { useMemo, useState } from "react";

type ShareButtonsProps = {
  title: string;
  path?: string;
  text?: string;
  className?: string;
  compact?: boolean;
};

function resolveUrl(path?: string) {
  if (typeof window === "undefined") return path || "";
  if (!path) return window.location.href;
  try {
    return new URL(path, window.location.origin).toString();
  } catch {
    return window.location.href;
  }
}

export default function ShareButtons({
  title,
  path,
  text,
  className = "",
  compact = false,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => resolveUrl(path), [path]);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text || title);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* User cancelled or browser blocked native share; leave fallback buttons visible. */
      }
    }
    await handleCopy();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const buttonClass =
    "inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-[#ff5e00] hover:text-[#ff5e00] transition-colors font-sans";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <button type="button" onClick={handleShare} className={buttonClass}>
        Share
      </button>
      <button type="button" onClick={handleCopy} className={buttonClass}>
        {copied ? "Copied" : "Copy link"}
      </button>
      {!compact ? (
        <>
          <a
            href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`}
            className={buttonClass}
          >
            Email
          </a>
        </>
      ) : null}
    </div>
  );
}
