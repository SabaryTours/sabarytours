"use client";

import Image from "next/image";
import Link from "next/link";
import { Tour } from "../data/packages";
import StarRating from "./StarRating";

interface TourGridProps {
  tours: Tour[];
  categorySlug: string;
}

export default function TourGrid({ tours, categorySlug }: TourGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
      {tours.map((tour) => (
        <Link
          key={tour.id}
          href={`/packages/${categorySlug}/${tour.slug}`}
          className="relative group overflow-hidden rounded-xl sm:rounded-2xl border-2 border-white block cursor-pointer isolate"
          style={{
            background: 'linear-gradient(to bottom, #999, #1e1d1d)',
            minHeight: '280px',
          }}
        >
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={tour.image}
              alt={tour.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
          </div>
          
          {/* Gradient Fade Overlay */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[140px] pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
            }}
          />
          
          {/* Blur Overlay with Fade */}
          <div 
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '120px',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)',
            }}
          />
          
          {/* Content Overlay at Bottom */}
          <div 
            className="absolute bottom-0 left-0 right-0 z-10"
            style={{
              padding: '12px 12px 16px',
            }}
          >
            {/* Rating */}
            {tour.rating && (
              <div className="mb-2">
                <StarRating rating={tour.rating} reviewCount={tour.reviewCount} size="sm" />
              </div>
            )}
            
            {/* Title */}
            <h3 
              className="text-white text-[16px] sm:text-[18px] md:text-[20px] uppercase mb-2 drop-shadow-lg line-clamp-2"
              style={{
                fontFamily: 'var(--font-unlimited-pie)',
                lineHeight: 'normal',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {tour.title}
            </h3>

            {/* Price and Booked Count */}
            <div className="flex items-center justify-between mt-auto">
              <span className="text-white text-[14px] sm:text-[16px] font-bold font-sans">
                {tour.price}
              </span>
              {tour.bookedCount && (
                <span className="text-white/80 text-[12px] font-sans">
                  Booked {tour.bookedCount} times
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

