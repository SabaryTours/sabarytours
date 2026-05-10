"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HeroSearchForm from "./HeroSearchForm";

export default function Hero({ initialImages = [] }: { initialImages?: string[] }) {
  const router = useRouter();
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
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <section className="relative w-full h-[800px] sm:h-[750px] md:h-[700px] lg:h-[650px] xl:h-[600px] font-sans flex items-center justify-center bg-gray-900">
      {/* Background images — Next/Image + priority on first slide improves LCP vs CSS backgrounds */}
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center mt-10 sm:mt-14 text-center">
        
        {/* Main Headline */}
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 sm:gap-5 mb-8 sm:mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/15 text-white/90 text-[11px] sm:text-xs font-semibold tracking-wider font-sans mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5e00] animate-pulse"></span>
            DISCOVER THE UNDISCOVERED
          </div>
          
          <h1 
            className="text-[26px] sm:text-[36px] md:text-[48px] lg:text-[54px] xl:text-[60px] text-white leading-[1.04] tracking-tight uppercase"
            style={{ 
              fontFamily: 'var(--font-unlimited-pie)',
              textShadow: '0 3px 20px rgba(0,0,0,0.45)'
            }}
          >
            Discover the Beauty of Ghana
          </h1>
          <div className="text-white/90 text-[14px] sm:text-[15px] md:text-[17px] max-w-xl font-sans mt-2 sm:mt-3 font-medium drop-shadow-md">
            We plan the trips, you make the memories. From waterfalls to street food, we take you beyond the brochures.
          </div>
        </div>

        {/* Floating Search Bar (Client Component) */}
        <HeroSearchForm />

        {/* Popular searches tags */}
        <div className="hidden sm:flex mt-6 flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="text-white/80 text-sm font-medium font-sans">Popular:</span>
          {["Kakum", "Quad Bike", "Cape Coast & Elmina", "Accra City Tour", "Safari Valley"].map((tag) => (
            <button
              key={tag}
              type="button"
              aria-label={`Search tours for ${tag}`}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium backdrop-blur-sm transition-all whitespace-nowrap"
              onClick={() => router.push(`/packages?q=${encodeURIComponent(tag)}`)}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
