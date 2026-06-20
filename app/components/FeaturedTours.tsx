import Link from "next/link";
import { getAllPublishedTours } from "../lib/api";
import type { FeaturedTourCard } from "../lib/featuredTours";
import FeaturedTourGridPaginated from "./FeaturedTourGridPaginated";
import { StarIcon } from "hugeicons-react";

type FeaturedToursProps = {
  showHeader?: boolean;
  className?: string;
  tours?: FeaturedTourCard[];
};

function PatternOverlay({
  className = "",
  opacity = 0.8,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`.trim()}
      style={{
        backgroundImage: "url(/assets/pattern.svg)",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        opacity,
        mixBlendMode: "overlay",
      }}
      aria-hidden
    />
  );
}

export default async function FeaturedTours({
  showHeader = true,
  className = "",
  tours: toursProp,
}: FeaturedToursProps) {
  const tours = toursProp ?? (await getAllPublishedTours());

  if (!showHeader) {
    return (
      <section
        id="featured-tours"
        className={`scroll-mt-28 w-full px-4 sm:px-6 md:px-12 py-12 md:py-16 ${className}`.trim()}
      >
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <FeaturedTourGridPaginated tours={tours} />
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Blue hero */}
      <section className="relative pt-28 pb-14 md:pb-16 overflow-hidden bg-gradient-to-br from-[#0060cc] to-[#004a9e] text-white">
        <PatternOverlay opacity={0.35} />
        <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10 text-center max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-white/90 mb-3 font-sans flex items-center justify-center gap-2">
            Featured tours
            <span className="flex items-center gap-0.5 text-yellow-400" aria-hidden>
              <StarIcon size={16} fill="currentColor" />
              <StarIcon size={16} fill="currentColor" />
              <StarIcon size={16} fill="currentColor" />
              <StarIcon size={16} fill="currentColor" />
              <StarIcon size={16} fill="currentColor" />
            </span>
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl uppercase font-bold leading-tight mb-4"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            Book a{" "}
            <span
              className="text-[#ff5e00]"
              style={{ textShadow: "1px 1px 0px #551f00" }}
            >
              tour
            </span>
          </h1>
          <p className="text-white/90 font-sans text-base sm:text-lg leading-relaxed">
            Browse every published Sabary Tours experience and book your next adventure across Ghana.
          </p>
        </div>
      </section>

      {/* Patterned blue content area */}
      <section
        id="featured-tours"
        className={`scroll-mt-28 w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 md:py-12 ${className}`.trim()}
      >
        <div
          className="relative rounded-2xl overflow-hidden py-12 md:py-16"
          style={{ backgroundColor: "#E8F4FC" }}
        >
          <PatternOverlay className="rounded-2xl" opacity={0.55} />

          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="flex gap-[5px] items-center justify-center mb-10">
              <div className="h-5 w-[25px] relative shrink-0">
                <svg
                  viewBox="0 0 25 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  style={{ transform: "scaleY(-1)" }}
                  aria-hidden
                >
                  <path
                    d="M5 10C5 8.89543 5.89543 8 7 8H18C19.1046 8 20 8.89543 20 10V12C20 13.1046 19.1046 14 18 14H7C5.89543 14 5 13.1046 5 12V10Z"
                    fill="#0060CC"
                  />
                  <circle cx="8" cy="14" r="2" fill="#0060CC" />
                  <circle cx="17" cy="14" r="2" fill="#0060CC" />
                  <rect x="7" y="6" width="11" height="2" rx="1" fill="#0060CC" />
                </svg>
              </div>
              <p className="text-[#0060cc] text-sm font-bold font-sans">
                All published tours — ready to book
              </p>
            </div>

            <FeaturedTourGridPaginated tours={tours} />

            <p className="text-center mt-10 text-sm text-[#1a4d7a] font-sans">
              Want something built around your group?{" "}
              <Link
                href="/customized-package"
                data-analytics-cta="get_quote"
                data-analytics-location="featured_tours"
                className="text-[#0060cc] font-bold hover:text-[#ff5e00] transition-colors"
              >
                Plan your Ghana trip
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
