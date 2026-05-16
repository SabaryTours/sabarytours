"use client";

import { useMemo } from "react";
import { normalizeRichTextHtml } from "../lib/normalizeRichText";

interface SafeHTMLProps {
  html: string;
  className?: string;
  allowScripts?: boolean;
}

/**
 * Renders sanitized CMS / Quill HTML with line-break normalization for the public site.
 */
export default function SafeHTML({
  html,
  className = "",
  allowScripts = false,
}: SafeHTMLProps) {
  const sanitizedHTML = useMemo(() => {
    if (!html) return "";

    let sanitized = normalizeRichTextHtml(html);

    if (!allowScripts) {
      sanitized = sanitized.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ""
      );
    }

    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
    sanitized = sanitized.replace(/javascript:/gi, "");

    return sanitized;
  }, [html, allowScripts]);

  if (!sanitizedHTML) {
    return null;
  }

  return (
    <div
      className={`rich-text-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
