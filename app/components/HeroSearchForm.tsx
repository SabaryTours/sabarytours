"use client";

import { Search01Icon, Calendar01Icon, Location01Icon } from "hugeicons-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearchForm() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append("q", location);
    if (date) params.append("date", date);
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-2xl border border-white/40 transform transition-all duration-300 hover:shadow-orange-500/20">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2">
        
        {/* Location Input */}
        <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-xl sm:rounded-full transition-colors cursor-text group">
          <Location01Icon size={24} className="text-gray-400 group-hover:text-[#ff5e00] transition-colors" />
          <div className="flex flex-col flex-1 text-left">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Where to?</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Accra, Cape Coast, etc." 
              className="bg-transparent text-gray-900 font-semibold outline-none placeholder:font-normal placeholder:text-gray-400 text-sm sm:text-base w-full"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-[1px] h-10 bg-gray-200"></div>

        {/* Date Input */}
        <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-xl sm:rounded-full transition-colors cursor-text group">
          <Calendar01Icon size={24} className="text-gray-400 group-hover:text-[#ff5e00] transition-colors" />
          <div className="flex flex-col flex-1 text-left">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</label>
            <input 
              type="text" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Add dates" 
              className="bg-transparent text-gray-900 font-semibold outline-none placeholder:font-normal placeholder:text-gray-400 text-sm sm:text-base w-full"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
            />
          </div>
        </div>

        {/* Search Button */}
        <button 
          type="submit"
          className="w-full sm:w-auto mt-2 sm:mt-0 bg-[#ff5e00] hover:bg-[#e55500] text-white px-8 md:px-10 py-4 sm:py-3.5 rounded-xl sm:rounded-full font-bold text-[16px] transition-all hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Search01Icon size={20} />
          <span className="font-sans">Search</span>
        </button>
        
      </form>
    </div>
  );
}
