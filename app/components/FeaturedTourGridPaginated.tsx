"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import type { FeaturedTourCard } from "../lib/featuredTours";

import { MAX_FEATURED_TOURS } from "../lib/featuredTours";

const PAGE_SIZE = MAX_FEATURED_TOURS;

type FeaturedTourGridPaginatedProps = {
  tours: FeaturedTourCard[];
  pageSize?: number;
};

export default function FeaturedTourGridPaginated({
  tours,
  pageSize = PAGE_SIZE,
}: FeaturedTourGridPaginatedProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(tours.length / pageSize));

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const visibleTours = useMemo(() => {
    const start = page * pageSize;
    return tours.slice(start, start + pageSize);
  }, [tours, page, pageSize]);

  const goToPage = (nextPage: number) => {
    const clamped = Math.max(0, Math.min(nextPage, totalPages - 1));
    setPage(clamped);
    document.getElementById("featured-tours")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (tours.length === 0) {
    return (
      <p className="text-center text-gray-600 font-sans py-8">
        No featured tours available right now. Check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {visibleTours.map((tour) => (
          <article
            key={tour.href + tour.title}
            className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48 sm:h-52 bg-gray-100">
              <Image
                src={tour.image || "/assets/placeholder-tour.jpg"}
                alt={tour.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-col flex-1 p-5 sm:p-6 gap-3 font-sans">
              <h3 className="text-lg font-bold text-[#222] leading-snug">{tour.title}</h3>
              <dl className="space-y-1.5 text-sm text-gray-600">
                <div>
                  <dt className="inline font-semibold text-gray-800">Duration: </dt>
                  <dd className="inline">{tour.duration}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-gray-800">Location: </dt>
                  <dd className="inline">{tour.location}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800">Highlights: </dt>
                  <dd>{tour.highlights}</dd>
                </div>
              </dl>
              <Link
                href={tour.href}
                className="mt-auto inline-flex justify-center items-center py-3 px-6 rounded-full bg-[#ff5e00] text-white text-sm font-bold hover:bg-[#e55500] transition-colors shadow-sm"
              >
                Book Your Tour
              </Link>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          aria-label="Featured tours pagination"
        >
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0060cc]/30 text-[#0060cc] text-sm font-bold font-sans hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft01Icon size={16} />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={page === i ? "page" : undefined}
                className={`min-w-[2.25rem] h-9 px-2 rounded-full text-sm font-bold font-sans transition-colors ${
                  page === i
                    ? "bg-[#0060cc] text-white"
                    : "bg-white/80 text-[#0060cc] border border-[#0060cc]/20 hover:bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0060cc]/30 text-[#0060cc] text-sm font-bold font-sans hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight01Icon size={16} />
          </button>
        </nav>
      )}

      {totalPages > 1 && (
        <p className="text-center text-xs text-[#1a4d7a]/80 font-sans">
          Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, tours.length)} of{" "}
          {tours.length} featured tours
        </p>
      )}
    </div>
  );
}
