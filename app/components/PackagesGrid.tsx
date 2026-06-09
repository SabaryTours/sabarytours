"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export interface PackageCategory {
  id: string;
  title: string;
  slug: string;
  image: string;
  description?: string;
  bookingCount?: number;
  startingPrice?: number;
  startingCurrency?: string;
}

function PackageCard({ pkg, isMobile = false }: { pkg: PackageCategory; isMobile?: boolean }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsInView(true);
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
        <Link
          href={`/packages/${pkg.slug}`}
      ref={cardRef}
      className={`relative group overflow-hidden rounded-2xl block cursor-pointer isolate transition-all duration-300 ${
        isMobile ? "shrink-0 snap-center" : ""
      }`}
          style={{
            background: "linear-gradient(to bottom, #999, #1e1d1d)",
            minHeight: "280px",
        ...(isMobile && {
          width: "85vw",
          maxWidth: "320px",
          transform: isInView ? "scale(1)" : "scale(0.9)",
          opacity: isInView ? 1 : 0.7,
        }),
          }}
        >
          {/* Image */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <Image
              src={pkg.image || "/assets/package-img1.png"}
              alt={pkg.title}
              fill
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Gradient Fade Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 h-30 pointer-events-none rounded-b-2xl"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Blur Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none rounded-b-2xl overflow-hidden"
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
            {typeof pkg.startingPrice === "number" && pkg.startingPrice > 0 ? (
              <p className="mb-2 text-center text-[11px] font-bold font-sans uppercase tracking-wide text-white/90 drop-shadow-md">
                Price starts from {pkg.startingCurrency || "GHS"} {pkg.startingPrice.toLocaleString()}
              </p>
            ) : null}
            <h3
          className={`text-white uppercase text-center drop-shadow-lg ${
            isMobile ? "text-[16px]" : "text-[16px] sm:text-[18px] md:text-[20px]"
          }`}
              style={{
                fontFamily: "var(--font-unlimited-pie)",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {pkg.title}
            </h3>
          </div>
        </Link>
  );
}

const HOMEPAGE_PACKAGE_LIMIT = 6;

export default function PackagesGrid({
  packages = [],
  limit,
  showViewAllLink = false,
  viewAllHref = "/packages",
}: {
  packages: PackageCategory[];
  limit?: number;
  showViewAllLink?: boolean;
  viewAllHref?: string;
}) {
  const visible = limit ? packages.slice(0, limit) : packages;
  const hasMore = limit ? packages.length > limit : false;

  return (
    <>
      {/* Mobile: Horizontal Scroll Container */}
      <div
        className="sm:hidden flex gap-4 overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide pb-6 -mx-4 px-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {visible.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} isMobile={true} />
        ))}
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {visible.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} isMobile={false} />
        ))}
      </div>

      {showViewAllLink && hasMore && (
        <p className="text-center mt-6 sm:mt-8">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#0060cc] hover:text-[#ff5e00] transition-colors font-sans"
          >
            Click to view all {packages.length} packages →
          </Link>
        </p>
      )}
    </>
  );
}

export { HOMEPAGE_PACKAGE_LIMIT };