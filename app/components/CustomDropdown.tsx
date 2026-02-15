"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowDown01Icon } from "hugeicons-react";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-[14px]  hover:border-gray-400 transition-all duration-200 flex items-center justify-between ${
          isOpen ? "border-[#ff5e00] ring-2 ring-[#ff5e00]" : ""
        }`}
      >
        <span className={selectedOption ? "text-[#222]" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ArrowDown01Icon
          className={`w-4 h-4 text-[#666] transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-3 text-left text-[14px] font-sans transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                option.value === value
                  ? "bg-[#fff5e6] text-[#ff5e00] font-semibold"
                  : "text-[#222] hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


