"use client";

import { useState } from "react";
import { Tour } from "../data/packages";

interface TourFiltersProps {
  tours: Tour[];
  onFilterChange: (filteredTours: Tour[]) => void;
}

export default function TourFilters({ tours, onFilterChange }: TourFiltersProps) {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minRating: "",
    duration: "",
    freeCancellation: false,
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    
    let filtered = [...tours];

    // Price filter
    if (newFilters.minPrice) {
      filtered = filtered.filter((tour) => (tour.priceValue || 0) >= parseFloat(newFilters.minPrice));
    }
    if (newFilters.maxPrice) {
      filtered = filtered.filter((tour) => (tour.priceValue || 0) <= parseFloat(newFilters.maxPrice));
    }

    // Rating filter
    if (newFilters.minRating) {
      filtered = filtered.filter((tour) => (tour.rating || 0) >= parseFloat(newFilters.minRating));
    }

    // Duration filter
    if (newFilters.duration) {
      filtered = filtered.filter((tour) => tour.duration === newFilters.duration);
    }

    // Free cancellation filter
    if (newFilters.freeCancellation) {
      filtered = filtered.filter((tour) => tour.freeCancellation === true);
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    const emptyFilters = {
      minPrice: "",
      maxPrice: "",
      minRating: "",
      duration: "",
      freeCancellation: false,
    };
    setFilters(emptyFilters);
    onFilterChange(tours);
  };

  const hasActiveFilters = Object.values(filters).some((value) => 
    value !== "" && value !== false
  );

  return (
    <div className="mb-4 flex justify-end">
      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[#666] text-[12px] font-sans hover:text-[#222]"
          >
            Clear
          </button>
        )}
        <select
          value={filters.minRating || ""}
          onChange={(e) => handleFilterChange({ ...filters, minRating: e.target.value })}
          className="px-2 py-1 text-[12px] font-sans text-[#666] bg-transparent border-none focus:outline-none cursor-pointer"
        >
          <option value="">Rating</option>
          <option value="4.5">4.5+</option>
          <option value="4.0">4.0+</option>
          <option value="3.5">3.5+</option>
        </select>
        <select
          value={filters.duration || ""}
          onChange={(e) => handleFilterChange({ ...filters, duration: e.target.value })}
          className="px-2 py-1 text-[12px] font-sans text-[#666] bg-transparent border-none focus:outline-none cursor-pointer"
        >
          <option value="">Duration</option>
          <option value="Half Day">Half Day</option>
          <option value="Full Day">Full Day</option>
          <option value="Multi-Day">Multi-Day</option>
        </select>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.freeCancellation}
            onChange={(e) => handleFilterChange({ ...filters, freeCancellation: e.target.checked })}
            className="w-3 h-3 text-[#ff5e00] border-gray-300 rounded focus:ring-[#ff5e00]"
          />
          <span className="text-[#666] text-[12px] font-sans">Free Cancel</span>
        </label>
      </div>
    </div>
  );
}
