"use client";

import { useMemo } from "react";
import { sanitizePublicHtml } from "../lib/sanitizeHtml";

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
  const sanitizedHTML = useMemo(() => sanitizePublicHtml(html, allowScripts), [html, allowScripts]);

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
