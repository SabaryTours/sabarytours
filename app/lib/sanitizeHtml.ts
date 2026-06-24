import { normalizeRichTextHtml } from "./normalizeRichText";

/** Sanitize CMS HTML for public display (server or client). */
export function sanitizePublicHtml(html: string, allowScripts = false): string {
  if (!html?.trim()) return "";

  let sanitized = normalizeRichTextHtml(html);

  if (!allowScripts) {
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );
  }

  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");

  return sanitized.trim();
}
