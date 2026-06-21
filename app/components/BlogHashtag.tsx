import Link from "next/link";
import { buildBlogTagHref, formatBlogHashtag } from "../lib/blogTags";

type BlogHashtagProps = {
  tag: string;
  className?: string;
  limit?: number;
};

type BlogHashtagListProps = {
  tags: string[];
  className?: string;
  limit?: number;
  linkable?: boolean;
};

export function BlogHashtag({ tag, className = "" }: BlogHashtagProps) {
  const label = formatBlogHashtag(tag);
  if (!label) return null;

  return (
    <span
      className={`rounded-full bg-orange-50 px-2 py-1 text-[11px] font-bold text-[#ff5e00] font-sans ${className}`}
    >
      {label}
    </span>
  );
}

export function BlogHashtagLink({ tag, className = "" }: BlogHashtagProps) {
  const label = formatBlogHashtag(tag);
  if (!label) return null;

  return (
    <Link
      href={buildBlogTagHref(tag)}
      className={`rounded-full bg-orange-50 px-2 py-1 text-[11px] font-bold text-[#ff5e00] font-sans hover:bg-orange-100 transition-colors ${className}`}
    >
      {label}
    </Link>
  );
}

export function BlogHashtagList({
  tags,
  className = "",
  limit,
  linkable = true,
}: BlogHashtagListProps) {
  const visibleTags = limit ? tags.slice(0, limit) : tags;
  if (!visibleTags.length) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleTags.map((tag) =>
        linkable ? (
          <BlogHashtagLink key={tag} tag={tag} className="px-3 py-1.5 text-xs" />
        ) : (
          <BlogHashtag key={tag} tag={tag} className="px-3 py-1.5 text-xs" />
        ),
      )}
    </div>
  );
}
