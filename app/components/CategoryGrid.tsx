"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PackageCategory } from "./PackagesGrid";

interface CategoryGridProps {
  packages?: PackageCategory[];
  initialQuery?: string;
}

export default function CategoryGrid({
  packages = [],
  initialQuery = "",
}: CategoryGridProps) {
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const visiblePackages = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = [...packages];

    if (q) {
      data = data.filter((item) => item.title?.toLowerCase().includes(q));
    }

    if (sortBy === "a-z") {
      data.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "oldest") {
      data.sort(
        (a, b) =>
          new Date((a as PackageCategory & { created_at?: string }).created_at || 0).getTime() -
          new Date((b as PackageCategory & { created_at?: string }).created_at || 0).getTime()
      );
    } else {
      data.sort(
        (a, b) =>
          new Date((b as PackageCategory & { created_at?: string }).created_at || 0).getTime() -
          new Date((a as PackageCategory & { created_at?: string }).created_at || 0).getTime()
      );
    }

    return data;
  }, [packages, query, sortBy]);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1 max-w-xl">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search packages by name..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-sans text-gray-800 outline-none focus:border-[#ff5e00] focus:ring-2 focus:ring-[#ff5e00]/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-sans">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-sans text-gray-800 outline-none focus:border-[#ff5e00]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="a-z">A to Z</option>
          </select>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500 font-sans">
        Showing {visiblePackages.length} {visiblePackages.length === 1 ? "package" : "packages"}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {visiblePackages.map((category) => (
        <Link
          key={category.id}
          href={`/packages/${category.slug}`}
          className="relative group isolate overflow-hidden rounded-xl sm:rounded-2xl  block cursor-pointer  transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "linear-gradient(to bottom, #999, #1e1d1d)",
            minHeight: "280px",
          }}
        >
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={category.image}
              alt={category.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
          </div>

          {/* Gradient Fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Blur */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: "100px",
              backdropFilter: "blur(25px)",
              WebkitBackdropFilter: "blur(25px)",
              maskImage:
                "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Title */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full px-3 py-10">
            <h3
              className="text-white text-[16px] sm:text-[18px] md:text-[20px] uppercase text-center drop-shadow-lg"
              style={{
                fontFamily: "var(--font-unlimited-pie)",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {category.title}
            </h3>
          </div>
        </Link>
      ))}
      </div>
    </>
  );
}