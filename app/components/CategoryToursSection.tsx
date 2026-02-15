"use client";

import { useState } from "react";
import { FilterIcon } from "hugeicons-react";
import { Tour } from "../data/packages";
import TourGrid from "./TourGrid";
import FilterModal from "./FilterModal";
import CustomDropdown from "./CustomDropdown";

interface CategoryToursSectionProps {
  tours: Tour[];
  categorySlug: string;
}

export default function CategoryToursSection({ tours, categorySlug }: CategoryToursSectionProps) {
  const [filteredTours, setFilteredTours] = useState<Tour[]>(tours);
  const [sortBy, setSortBy] = useState<string>("default");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    const sorted = [...filteredTours];

    switch (sortType) {
      case "price-low":
        sorted.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
        break;
      case "price-high":
        sorted.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
        sorted.sort((a, b) => (b.bookedCount || 0) - (a.bookedCount || 0));
        break;
      default:
        // Keep current filtered results, just reset sort
        break;
    }

    setFilteredTours(sorted);
  };

  return (
    <>
      {/* Filter and Sort Bar */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 rounded-full bg-gray-100 text-[#222] text-[14px] font-medium font-sans hover:bg-gray-200 hover:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <FilterIcon className="w-4 h-4" />
            Filter
          </button>
          <p className="text-[#666] text-[14px] font-sans">
            Showing {filteredTours.length} {filteredTours.length === 1 ? "tour" : "tours"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[#666] text-[14px] font-sans">Sort by:</label>
          <CustomDropdown
            options={[
              { value: "default", label: "Default" },
              { value: "popular", label: "Most Popular" },
              { value: "rating", label: "Highest Rated" },
              { value: "price-low", label: "Price: Low to High" },
              { value: "price-high", label: "Price: High to Low" },
            ]}
            value={sortBy}
            onChange={handleSort}
            className="w-[200px]"
          />
        </div>
      </div>

      <TourGrid tours={filteredTours} categorySlug={categorySlug} />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        tours={tours}
        onFilterChange={setFilteredTours}
      />
    </>
  );
}

