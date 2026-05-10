"use client";

import { useCurrency } from "../context/CurrencyContext";

interface PaymentOptionsProps {
  /** Total in GHS — same basis as subtotal/total on the booking page. */
  totalPrice: number;
  selectedOption: "full" | "deposit";
  onSelectOption: (option: "full" | "deposit") => void;
  depositPercentage?: number;
}

export default function PaymentOptions({
  totalPrice,
  selectedOption,
  onSelectOption,
  depositPercentage = 30,
}: PaymentOptionsProps) {
  const { symbol, convert } = useCurrency();
  const depositAmount = (totalPrice * depositPercentage) / 100;
  const remainingAmount = totalPrice - depositAmount;

  const fmt = (amountGhs: number) =>
    `${symbol} ${convert(amountGhs, "GHS").toFixed(2)}`;

  return (
    <div className="space-y-3">
      <label className="block text-[#222] text-[14px] font-bold mb-3 font-sans">
        Payment Option
      </label>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onSelectOption("full")}
          className={`
            w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
            ${selectedOption === "full"
              ? "border-[#ff5e00] bg-[#fff5e6]"
              : "border-gray-200 bg-white hover:border-gray-300"
            }
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`
                shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedOption === "full"
                  ? "border-[#ff5e00] bg-[#ff5e00]"
                  : "border-gray-300"
                }
              `}
              >
                {selectedOption === "full" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[#222] text-[15px] font-bold font-sans">
                  Pay Full Amount
                </div>
                <div className="text-[#666] text-[12px] font-normal font-sans">
                  Pay the complete amount now
                </div>
              </div>
            </div>
            <div className="text-[#222] text-[18px] font-bold font-sans shrink-0">
              {fmt(totalPrice)}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectOption("deposit")}
          className={`
            w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
            ${selectedOption === "deposit"
              ? "border-[#ff5e00] bg-[#fff5e6]"
              : "border-gray-200 bg-white hover:border-gray-300"
            }
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`
                shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedOption === "deposit"
                  ? "border-[#ff5e00] bg-[#ff5e00]"
                  : "border-gray-300"
                }
              `}
              >
                {selectedOption === "deposit" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[#222] text-[15px] font-bold font-sans">
                  Pay Deposit ({depositPercentage}%)
                </div>
                <div className="text-[#666] text-[12px] font-normal font-sans">
                  Pay {fmt(depositAmount)} now, {fmt(remainingAmount)} later
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[#222] text-[18px] font-bold font-sans">
                {fmt(depositAmount)}
              </div>
              <div className="text-[#666] text-[11px] font-normal font-sans">
                {fmt(remainingAmount)} due later
              </div>
            </div>
          </div>
        </button>
      </div>

      {selectedOption === "deposit" && (
        <div className="bg-[#fff5e6] border border-[#ffd4a8] rounded-lg p-3 mt-3">
          <p className="text-[#893300] text-[12px] font-normal font-sans">
            <strong>Note:</strong> The remaining balance of {fmt(remainingAmount)} will be due before your tour date.
          </p>
        </div>
      )}
    </div>
  );
}
