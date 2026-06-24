"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search01Icon } from "hugeicons-react";

type BlogSearchBarProps = {
  defaultQuery?: string;
  className?: string;
  placeholder?: string;
  preserveParams?: Record<string, string>;
};

export default function BlogSearchBar({
  defaultQuery = "",
  className = "",
  placeholder = "Search by title, topic, or keyword...",
  preserveParams = {},
}: BlogSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    Object.entries(preserveParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);

    router.push(params.toString() ? `/blog?${params.toString()}` : "/blog");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <label className="sr-only" htmlFor="blog-search">
        Search blog posts
      </label>
      <div className="relative flex-1">
        <Search01Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          id="blog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-sans text-[#222] outline-none focus:border-[#ff5e00] focus:ring-2 focus:ring-[#ff5e00]/20"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-[#ff5e00] px-6 py-3 text-sm font-bold text-white font-sans hover:bg-[#e55500] transition-colors shrink-0"
      >
        Search
      </button>
    </form>
  );
}
