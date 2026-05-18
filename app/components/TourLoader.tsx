"use client";

import { Airplane01Icon } from "hugeicons-react";

export default function TourLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-4 border-dashed border-[#ff5e00] opacity-30 animate-spin"
          style={{ animationDuration: "3s" }}
        />
        <div className="absolute inset-2 rounded-full border-2 border-[#0060cc] opacity-20" />

        <div className="animate-bounce text-[#ff5e00]">
          <Airplane01Icon size={28} className="transform rotate-45" />
        </div>
      </div>

      <p
        className="text-[#222] text-sm sm:text-base font-semibold text-center max-w-md px-6 leading-relaxed animate-pulse"
        style={{ fontFamily: "var(--font-unlimited-pie)" }}
      >
        Your unforgettable Ghana experience starts with Sabary Tours
      </p>
    </div>
  );
}
