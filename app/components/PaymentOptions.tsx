"use client";

interface PaymentOptionsProps {
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
  const depositAmount = (totalPrice * depositPercentage) / 100;
  const remainingAmount = totalPrice - depositAmount;

  return (
    <div className="space-y-3">
      <label className="block text-[#222] text-[14px] font-bold mb-3 font-sans">
        Payment Option
      </label>
      
      <div className="space-y-3">
        {/* Full Payment Option */}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedOption === "full"
                  ? "border-[#ff5e00] bg-[#ff5e00]"
                  : "border-gray-300"
                }
              `}>
                {selectedOption === "full" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <div className="text-[#222] text-[15px] font-bold font-sans">
                  Pay Full Amount
                </div>
                <div className="text-[#666] text-[12px] font-normal font-sans">
                  Pay the complete amount now
                </div>
              </div>
            </div>
            <div className="text-[#222] text-[18px] font-bold font-sans">
              ${totalPrice.toFixed(2)}
            </div>
          </div>
        </button>

        {/* Deposit Option */}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedOption === "deposit"
                  ? "border-[#ff5e00] bg-[#ff5e00]"
                  : "border-gray-300"
                }
              `}>
                {selectedOption === "deposit" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <div className="text-[#222] text-[15px] font-bold font-sans">
                  Pay Deposit ({depositPercentage}%)
                </div>
                <div className="text-[#666] text-[12px] font-normal font-sans">
                  Pay ${depositAmount.toFixed(2)} now, ${remainingAmount.toFixed(2)} later
                </div>
              </div>
            </div>
            <div>
              <div className="text-[#222] text-[18px] font-bold font-sans">
                ${depositAmount.toFixed(2)}
              </div>
              <div className="text-[#666] text-[11px] font-normal font-sans text-right">
                ${remainingAmount.toFixed(2)} due later
              </div>
            </div>
          </div>
        </button>
      </div>

      {selectedOption === "deposit" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-[#0060CC] text-[12px] font-normal font-sans">
            <strong>Note:</strong> The remaining balance of ${remainingAmount.toFixed(2)} will be due before your tour date.
          </p>
        </div>
      )}
    </div>
  );
}

