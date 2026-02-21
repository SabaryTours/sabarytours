"use client";

import { useState } from "react";
import { CancelCircleIcon } from "hugeicons-react";
import { Tour } from "../data/packages";
import CustomDropdown from "./CustomDropdown";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tours: Tour[];
  onFilterChange: (filteredTours: Tour[]) => void;
}

export default function FilterModal({ isOpen, onClose, tours, onFilterChange }: FilterModalProps) {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minRating: "",
    duration: "",
    freeCancellation: false,
  });

  if (!isOpen) return null;

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

  const applyFilters = () => {
    handleFilterChange(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 
            className="text-[24px] text-[#ff5e00] font-normal uppercase"
            style={{
              fontFamily: 'var(--font-unlimited-pie)',
              textShadow: '1px 1px 0px #331300',
            }}
          >
            Filter Tours
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CancelCircleIcon className="w-5 h-5 text-[#222]" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-[#222] text-[14px] font-bold mb-3 font-sans">
              Price Range
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange({ ...filters, minPrice: e.target.value })}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-[14px]"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange({ ...filters, maxPrice: e.target.value })}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-[14px]"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-[#222] text-[14px] font-bold mb-3 font-sans">
              Minimum Rating
            </label>
            <CustomDropdown
              options={[
                { value: "", label: "All Ratings" },
                { value: "4.5", label: "4.5+ Stars" },
                { value: "4.0", label: "4.0+ Stars" },
                { value: "3.5", label: "3.5+ Stars" },
                { value: "3.0", label: "3.0+ Stars" },
              ]}
              value={filters.minRating}
              onChange={(value) => handleFilterChange({ ...filters, minRating: value })}
              placeholder="All Ratings"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[#222] text-[14px] font-bold mb-3 font-sans">
              Duration
            </label>
            <CustomDropdown
              options={[
                { value: "", label: "All Durations" },
                { value: "Half Day", label: "Half Day" },
                { value: "Full Day", label: "Full Day" },
                { value: "Multi-Day", label: "Multi-Day" },
              ]}
              value={filters.duration}
              onChange={(value) => handleFilterChange({ ...filters, duration: value })}
              placeholder="All Durations"
            />
          </div>

          {/* Free Cancellation */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.freeCancellation}
                onChange={(e) => handleFilterChange({ ...filters, freeCancellation: e.target.checked })}
                className="w-5 h-5 text-[#ff5e00] border-gray-300 rounded focus:ring-[#ff5e00]"
              />
              <span className="text-[#222] text-[14px] font-bold font-sans">Free Cancellation</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white rounded-b-2xl">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-[#666] font-bold text-[14px] hover:bg-gray-50 transition-colors font-sans"
            >
              Clear All
            </button>
          )}
          <button
            onClick={applyFilters}
            className="flex-1 px-4 py-3 rounded-lg bg-[#ff5e00] text-white font-bold text-[14px] hover:bg-[#e55500] hover:shadow-lg transition-all duration-200 font-sans"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

