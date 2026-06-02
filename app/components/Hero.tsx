"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero({ initialImages = [] }: { initialImages?: string[] }) {
  const [images] = useState<string[]>(
    Array.from(new Set(initialImages.filter(Boolean))).length > 0
      ? Array.from(new Set(initialImages.filter(Boolean)))
      : ["/assets/apex-61.JPG"]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <section className="relative w-full h-[800px] sm:h-[750px] md:h-[700px] lg:h-[650px] xl:h-[600px] font-sans flex items-center justify-center bg-gray-900">
      {images.map((imgUrl, index) => (
        <div
          key={imgUrl + index}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={index !== currentIndex}
        >
          <Image
            src={imgUrl}
            alt={
              index === 0
                ? "Ghana landscapes and experiences featured by Sabary Tours"
                : ""
            }
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : undefined}
            sizes="100vw"
            className="object-cover"
            quality={index === 0 ? 82 : 75}
          />
          <div className="absolute inset-0 bg-black/40" aria-hidden />
        </div>
      ))}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center pt-16 sm:pt-20 md:pt-24 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 sm:gap-5 mb-10 sm:mb-12 animate-fade-in-up">
          <h1
            className="text-[26px] sm:text-[36px] md:text-[48px] lg:text-[54px] xl:text-[60px] text-white leading-[1.04] tracking-tight uppercase"
            style={{
              fontFamily: "var(--font-unlimited-pie)",
              textShadow: "0 3px 20px rgba(0,0,0,0.45)",
            }}
          >
            Discover the Beauty of Ghana
          </h1>
          <p className="text-white/90 text-[14px] sm:text-[15px] md:text-[17px] max-w-xl font-sans mt-3 sm:mt-4 font-medium drop-shadow-md">
            We plan the trips, you make the memories. From waterfalls to street food,
            we take you beyond the brochures.
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-lg sm:max-w-none animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          <Link
            href="/featured-tours"
            className="inline-flex justify-center items-center px-8 py-4 rounded-full bg-[#ff5e00] text-white font-bold text-sm sm:text-base hover:bg-[#e55500] transition-colors shadow-lg shadow-orange-900/30"
          >
            Book a Tour
          </Link>
          <Link
            href="/customized-package"
            className="inline-flex justify-center items-center px-8 py-4 rounded-full bg-white/95 text-[#222] font-bold text-sm sm:text-base hover:bg-white border border-white/50 transition-colors shadow-lg"
          >
            Plan Your Trip
          </Link>
        </div>
      </div>
    </section>
  );
}
