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
      className={`group flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-xl transition-all duration-300 ${
        isMobile ? "shrink-0 snap-center w-[85vw] max-w-[300px]" : ""
      }`}
      style={
        isMobile
          ? {
              transform: isInView ? "scale(1)" : "scale(0.95)",
              opacity: isInView ? 1 : 0.75,
            }
          : undefined
      }
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={tour.image || "/assets/placeholder-tour.jpg"}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          sizes={isMobile ? "85vw" : "(max-width: 1024px) 50vw, 25vw"}
        />
        <span className="absolute top-3 left-3 rounded-full bg-[#ff5e00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white font-sans shadow-sm">
          Featured
        </span>
      </div>
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2 font-sans">
        <h3 className="text-base font-bold text-[#222] leading-snug line-clamp-2">{tour.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{tour.highlights}</p>
        <Link
          href={tour.href}
          className="mt-auto inline-flex justify-center items-center py-2.5 px-4 rounded-full bg-[#ff5e00] text-white text-sm font-bold hover:bg-[#e55500] transition-colors"
        >
          Book now
        </Link>
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
