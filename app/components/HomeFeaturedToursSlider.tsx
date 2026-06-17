"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FeaturedTourCard } from "../lib/featuredTours";

function FeaturedTourCardItem({
  tour,
  isMobile = false,
}: {
  tour: FeaturedTourCard;
  isMobile?: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsInView(true);
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <article
      ref={cardRef}
      className={`overflow-hidden relative rounded-[16px] bg-white shadow-lg shrink-0 snap-center group transition-all duration-300 ${
        isMobile
          ? "h-[380px] w-[280px]"
          : "w-full aspect-[3/4]"
      }`}
      style={
        isMobile
          ? {
              transform: isInView ? "scale(1)" : "scale(0.9)",
              opacity: isInView ? 1 : 0.7,
            }
          : undefined
      }
    >
      {/* Image Container */}
      <div className="absolute inset-0">
        <Image
          src={tour.image || "/assets/placeholder-tour.jpg"}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes={isMobile ? "280px" : "(max-width: 1024px) 50vw, 25vw"}
        />
        <span className="absolute top-3 left-3 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white border border-white/20 font-sans shadow-sm z-10">
          Featured
        </span>
      </div>

      {/* Progressive Blur Overlay with Gradual Fade */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-[160px]">
        {/* Gradient mask for gradual fade */}
        <div className="absolute inset-0 team-blur-fade pointer-events-none" />
        
        {/* Info Card */}
        <div className="absolute left-1/2 -translate-x-1/2 bg-[#0060cc]/40 backdrop-blur-md flex flex-col items-start rounded-[6px] bottom-[10px] gap-[6px] p-[10px] w-[calc(100%-20px)] border border-white/20 shadow-lg">
          <div className="text-white text-[15px] font-bold leading-[20px] w-full font-sans truncate transition-colors">
            {tour.title}
          </div>
          <div className="text-[#d4d3d4] text-[13px] font-normal leading-[18px] w-full font-sans line-clamp-2">
            {tour.highlights}
          </div>
          <Link
            href={tour.href}
            data-analytics-cta="book_now"
            data-analytics-location="home_featured_tours"
            className="w-full text-center py-2 mt-1 rounded bg-[#ff5e00] text-white text-[13px] font-bold hover:bg-[#e55500] transition-colors shadow-sm"
          >
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function HomeFeaturedToursSlider({ tours }: { tours: FeaturedTourCard[] }) {
  return (
    <>
      <div
        className="sm:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tours.map((tour) => (
          <FeaturedTourCardItem key={tour.href} tour={tour} isMobile />
        ))}
      </div>

      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {tours.map((tour) => (
          <FeaturedTourCardItem key={tour.href} tour={tour} />
        ))}
      </div>
    </>
  );
}
