"use client";

import Image from "next/image";
import Link from "next/link";
import { packageCategories } from "../data/packages";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {packageCategories.map((category) => (
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
  );
}