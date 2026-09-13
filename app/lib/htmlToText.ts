/**
 * Converts CMS / Quill rich-text HTML into plain text.
 * Use this wherever stored HTML has to be shown as text (card excerpts,
 * meta descriptions, emails) instead of being rendered with SafeHTML.
 */

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  middot: "·",
  bull: "•",
  deg: "°",
  eacute: "é",
  egrave: "è",
  agrave: "à",
  ccedil: "ç",
};

function fromCodePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

/** Decodes the HTML entities that show up in Quill/Word pasted content. */
export function decodeHtmlEntities(value: string): string {
  if (!value) return "";

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (match, name) => {
      const replacement = NAMED_ENTITIES[String(name).toLowerCase()];
      return replacement === undefined ? match : replacement;
    });
}

/** Strips tags and decodes entities, keeping block boundaries as line breaks. */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return "";

  const text = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(p|div|h[1-6]|tr|blockquote|ul|ol|table)>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(text)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t ​]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Single-line summary of rich-text HTML, optionally truncated. */
export function htmlToExcerpt(
  html: string | null | undefined,
  maxLength?: number,
): string {
  const text = htmlToPlainText(html).replace(/\s*\n\s*/g, " ").trim();

  if (!maxLength || text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}
