/** Normalize hashtag/tag input from CMS (strips leading #, dedupes case-insensitively). */
export function normalizeBlogTags(raw: string[] | string): string[] {
  const items = Array.isArray(raw)
    ? raw
    : raw.split(",").map((part) => part.trim());

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item.replace(/^#+/, "").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

export function blogTagToSlug(tag: string): string {
  return tag
    .replace(/^#+/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatBlogHashtag(tag: string): string {
  const label = tag.replace(/^#+/, "").trim();
  if (!label) return "";
  const compact = label.replace(/\s+/g, "");
  return `#${compact}`;
}

export function buildBlogTagHref(tag: string): string {
  return `/blog?tag=${encodeURIComponent(tag.replace(/^#+/, "").trim())}`;
}

export function tagMatchesParam(tag: string, param: string): boolean {
  const normalizedParam = param.replace(/^#+/, "").trim();
  if (!normalizedParam) return false;
  return (
    tag.toLowerCase() === normalizedParam.toLowerCase()
    || blogTagToSlug(tag) === blogTagToSlug(normalizedParam)
  );
}
