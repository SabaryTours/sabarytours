"use client";

import { Search01Icon } from "hugeicons-react";
import { BLOG_CATEGORIES } from "../lib/blogCategories";
import { formatBlogHashtag } from "../lib/blogTags";

type BlogFilterBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  tag: string;
  onTagChange: (value: string) => void;
  popularTags?: string[];
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  resultCount?: number;
  searchPlaceholder?: string;
};

export default function BlogFilterBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  tag,
  onTagChange,
  popularTags = [],
  statusFilter,
  onStatusFilterChange,
  resultCount,
  searchPlaceholder = "Search by title, summary, hashtag, or section...",
}: BlogFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search01Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-sans text-[#222] outline-none focus:border-[#ff5e00] focus:ring-2 focus:ring-[#ff5e00]/20"
          />
        </div>
        {onStatusFilterChange ? (
          <select
            value={statusFilter ?? "all"}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className="px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-sm bg-white text-black shrink-0"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-[#0060cc] font-sans">Browse by section</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors ${
              category === "all"
                ? "bg-[#ff5e00] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#ff5e00]"
            }`}
          >
            All sections
          </button>
          {BLOG_CATEGORIES.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => onCategoryChange(item.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors ${
                category === item.slug
                  ? "bg-[#ff5e00] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#ff5e00]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {popularTags.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#0060cc] font-sans">Browse by hashtag</p>
            {tag ? (
              <button
                type="button"
                onClick={() => onTagChange("")}
                className="text-xs font-bold text-gray-500 hover:text-[#ff5e00] font-sans"
              >
                Clear hashtag
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 16).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onTagChange(tag === item ? "" : item)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors ${
                  tag === item
                    ? "bg-[#ff5e00] text-white"
                    : "bg-orange-50 text-[#ff5e00] hover:bg-orange-100"
                }`}
              >
                {formatBlogHashtag(item)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {typeof resultCount === "number" ? (
        <p className="text-xs text-gray-500 font-sans">
          Showing {resultCount} {resultCount === 1 ? "article" : "articles"}
        </p>
      ) : null}
    </div>
  );
}

export function BlogCategoryBadge({
  category,
  size = "sm",
}: {
  category: string | null | undefined;
  size?: "sm" | "xs";
}) {
  const label = category
    ? BLOG_CATEGORIES.find((item) => item.slug === category)?.label ?? null
    : null;

  const classes =
    size === "xs"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-[11px]";

  if (label) {
    return (
      <span
        className={`inline-flex rounded-full bg-[#ff5e00] font-bold uppercase tracking-wide text-white font-sans ${classes}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full bg-gray-100 font-bold uppercase tracking-wide text-gray-500 font-sans ${classes}`}
    >
      Uncategorized
    </span>
  );
}

export function BlogTagList({ tags, limit = 4 }: { tags: string[]; limit?: number }) {
  if (!tags.length) {
    return <span className="text-xs text-gray-400 font-sans">No hashtags</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, limit).map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#ff5e00] font-sans"
        >
          {formatBlogHashtag(tag)}
        </span>
      ))}
      {tags.length > limit ? (
        <span className="text-[10px] text-gray-400 font-sans self-center">+{tags.length - limit}</span>
      ) : null}
    </div>
  );
}
