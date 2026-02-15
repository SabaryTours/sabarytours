"use client";

import { useState } from "react";

interface VoucherCodeProps {
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode?: string;
  discount?: number;
}

export default function VoucherCode({
  onApply,
  onRemove,
  appliedCode,
  discount,
}: VoucherCodeProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Mock voucher codes - replace with API call
  const validVouchers: Record<string, number> = {
    "SAVE10": 10,
    "WELCOME20": 20,
    "SUMMER15": 15,
    "REFERRAL25": 25,
  };

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a voucher code");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const upperCode = code.toUpperCase().trim();
    const discountPercent = validVouchers[upperCode];

    if (discountPercent) {
      onApply(upperCode, discountPercent);
      setCode("");
      setError("");
    } else {
      setError("Invalid voucher code. Please try again.");
    }

    setIsLoading(false);
  };

  const handleRemove = () => {
    setCode("");
    setError("");
    onRemove();
  };

  if (appliedCode) {
    return (
      <div className="space-y-2">
        <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
          Voucher / Referral Code
        </label>
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex-1">
            <div className="text-[#00A86B] text-[13px] font-semibold font-sans">
              Code Applied: {appliedCode}
            </div>
            <div className="text-[#00A86B] text-[12px] font-normal font-sans">
              {discount}% discount applied
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[#00A86B] hover:text-[#008055] text-[12px] font-semibold underline font-sans"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-[#222] text-[14px] font-bold mb-2 font-sans">
        Voucher / Referral Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="Enter code"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-[#222] placeholder:text-gray-400 uppercase"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="px-6 py-3 bg-[#ff5e00] text-white rounded-lg font-bold text-[14px] hover:bg-[#e55500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
        >
          {isLoading ? "..." : "Apply"}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-[12px] font-sans">{error}</p>
      )}
      <p className="text-[#666] text-[11px] font-normal font-sans">
        Have a voucher or referral code? Enter it above to apply your discount.
      </p>
    </div>
  );
}

