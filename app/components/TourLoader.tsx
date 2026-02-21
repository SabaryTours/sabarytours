"use client";

import { Airplane01Icon } from "hugeicons-react";

export default function TourLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Spinning dashed circle for the globe vibe */}
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#ff5e00] opacity-30 animate-spin" style={{ animationDuration: '3s' }}></div>
        {/* Inner solid circle */}
        <div className="absolute inset-2 rounded-full border-2 border-[#0060cc] opacity-20"></div>
        
        {/* Bouncing Airplane Icon */}
        <div className="animate-bounce text-[#ff5e00]">
          <Airplane01Icon size={28} className="transform rotate-45" />
        </div>
      </div>
      
      {/* Animated Text */}
      <div className="flex flex-col items-center">
        <h3 className="text-[#222] font-bold text-lg uppercase tracking-widest" style={{ fontFamily: "var(--font-unlimited-pie)" }}>
          Pack Your Bags
        </h3>
        <p className="text-[#8e8e8e] text-sm font-semibold animate-pulse">
          Loading your next adventure...
        </p>
      </div>
    </div>
  );
}
