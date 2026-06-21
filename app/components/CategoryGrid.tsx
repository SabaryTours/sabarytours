"use client";

import CachedImage from "./CachedImage";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PackageCategory } from "./PackagesGrid";
import { safeImageUrl } from "../lib/safeImageUrl";
import CardPriceBlob from "./CardPriceBlob";

interface CategoryGridProps {
  packages?: PackageCategory[];
  initialQuery?: string;
}

export default function CategoryGrid({
  packages = [],
  initialQuery = "",
}: CategoryGridProps) {
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const effectiveQuery = (query.trim() || initialQuery.trim()).trim();
  const effectiveQueryLower = effectiveQuery.toLowerCase();

  const visiblePackages = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = [...packages];

    if (q) {
      data = data.filter((item) => {
        const title = item.title?.toLowerCase() ?? "";
        const desc = (item as PackageCategory & { description?: string }).description?.toLowerCase() ?? "";
        const slug = item.slug?.toLowerCase() ?? "";
        return title.includes(q) || desc.includes(q) || slug.includes(q);
      });
    }

    if (sortBy === "popular") {
      data.sort(
        (a, b) =>
          ((b as PackageCategory & { bookingCount?: number }).bookingCount || 0) -
          ((a as PackageCategory & { bookingCount?: number }).bookingCount || 0)
      );
    } else if (sortBy === "a-z") {
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

  const showNoMatch =
    visiblePackages.length === 0 && effectiveQueryLower.length >= 2;

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1 max-w-xl">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, region, or keyword…"
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
            <option value="popular">Most popular</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="a-z">A to Z</option>
          </select>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500 font-sans">
        Showing {visiblePackages.length} {visiblePackages.length === 1 ? "package" : "packages"}
      </div>

      {showNoMatch && (
        <div className="mb-8 rounded-2xl border border-orange-100 bg-gradient-to-br from-[#fff7f0] to-white p-6 sm:p-8 text-center">
          <p className="text-gray-800 font-sans font-semibold text-lg mb-2">No packages match &quot;{effectiveQuery}&quot;</p>
          <p className="text-gray-600 font-sans text-sm max-w-lg mx-auto mb-5">
            We might still be able to help—private trips, new routes, or something coming soon. Tell us what you have in
            mind.
          </p>
          <Link
            href={`/contact?from=packages&q=${encodeURIComponent(effectiveQuery)}`}
            className="inline-flex rounded-full bg-[#ff5e00] px-6 py-3 text-sm font-bold text-white hover:bg-[#e55500] font-sans"
          >
            Contact us
          </Link>
        </div>
      )}

      {!showNoMatch && (
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
            <CachedImage
              src={safeImageUrl(category.image)}
              alt={category.title}
              fill
              maxWidth={640}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
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

          {typeof category.startingPrice === "number" && category.startingPrice > 0 ? (
            <CardPriceBlob
              price={`${category.startingCurrency || "GHS"} ${category.startingPrice.toLocaleString()}`}
              className="absolute top-3 right-3 z-10"
            />
          ) : null}

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
      )}
    </>
  );
}