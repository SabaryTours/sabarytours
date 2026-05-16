/**
 * Normalizes HTML from Quill / Word / PDF paste so it reads naturally on the site.
 * Fixes stray line breaks, empty blocks, and bullet paragraphs stored as plain text.
 */
export function normalizeRichTextHtml(html: string): string {
  if (!html?.trim()) return "";

  let sanitized = html;

  // Common encoding artifacts
  sanitized = sanitized.replace(/\uFFFD/g, "'");
  sanitized = sanitized.replace(/â€™/g, "\u2019");
  sanitized = sanitized.replace(/â€˜/g, "\u2018");
  sanitized = sanitized.replace(/â€œ/g, "\u201C");
  sanitized = sanitized.replace(/â€\u009D/g, "\u201D");
  sanitized = sanitized.replace(/â€"/g, "\u2014");
  sanitized = sanitized.replace(/â€"/g, "\u2013");
  sanitized = sanitized.replace(/â€¦/g, "\u2026");
  sanitized = sanitized.replace(/Ã©/g, "é");
  sanitized = sanitized.replace(/Ã¨/g, "è");
  sanitized = sanitized.replace(/Ã¢/g, "â");

  // Quill artifacts
  sanitized = sanitized.replace(/<span class="ql-cursor[^"]*">[\s\S]*?<\/span>/gi, "");

  // Empty paragraphs (including Quill's <p><br></p>)
  sanitized = sanitized.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");

  // Collapse stacked line breaks
  sanitized = sanitized.replace(/(<br\s*\/?>\s*){2,}/gi, "<br>");

  // PDF mid-word splits: passpo<br>rt → passport
  sanitized = sanitized.replace(
    /([a-zA-Z]{5,})<br\s*\/?>\s*([a-z]{2,4})(?=[\s<.,;:!?]|$)/gi,
    "$1$2"
  );

  // Soft line wraps inside a paragraph: join with a space (not after . ! ? :)
  sanitized = sanitized.replace(
    /([^<>\s.!?:])\s*<br\s*\/?>\s*(?=[a-z])/gi,
    "$1 "
  );

  // Same for raw newlines in plain-text-ish fragments
  sanitized = sanitized.replace(
    /([^<>\s.!?:])\s*[\r\n]+\s*(?=[a-z])/g,
    "$1 "
  );

  // Consecutive <p> blocks that are really one sentence split by paste
  let prev = "";
  while (prev !== sanitized) {
    prev = sanitized;
    sanitized = sanitized.replace(
      /<\/p>\s*<p>([a-z(,][^<]*?)<\/p>/gi,
      " $1</p>"
    );
  }

  // Bullet lines saved as paragraphs: <p>* item</p> → <ul><li>item</li></ul>
  sanitized = convertBulletParagraphs(sanitized);

  // Trim trailing <br> inside paragraphs
  sanitized = sanitized.replace(/(<br\s*\/?>\s*)+(?=<\/p>)/gi, "");

  return sanitized.trim();
}

function convertBulletParagraphs(html: string): string {
  const bulletBlock =
    /(?:<p>\s*(?:[*•\-–]|\u2022)\s*([\s\S]*?)<\/p>\s*)+/gi;

  return html.replace(bulletBlock, (block) => {
    const items = [
      ...block.matchAll(/<p>\s*(?:[*•\-–]|\u2022)\s*([\s\S]*?)<\/p>/gi),
    ];
    if (items.length === 0) return block;

    const lis = items
      .map((m) => m[1].replace(/<br\s*\/?>/gi, " ").trim())
      .filter(Boolean)
      .map((text) => `<li>${text}</li>`)
      .join("");

    return lis ? `<ul>${lis}</ul>` : block;
  });
}
