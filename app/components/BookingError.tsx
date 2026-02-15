"use client";

interface BookingErrorProps {
  onClose: () => void;
  onRetry?: () => void;
}

export default function BookingError({ onClose, onRetry }: BookingErrorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#222"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h2 className="text-[#222] text-[20px] sm:text-[24px] font-bold font-sans">
              Booking
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#222"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center">
          {/* Illustration */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#FFE5D4] flex items-center justify-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" fill="#FFE5D4" />
              <path
                d="M30 30 L70 70 M70 30 L30 70"
                stroke="#FF5E00"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h3 className="text-[#222] text-[24px] sm:text-[28px] font-bold mb-4 font-sans">
            Oops! Something didn&apos;t go as planned.
          </h3>

          <p className="text-[#666] text-[14px] sm:text-[16px] leading-[24px] mb-2 font-sans">
            We ran into a small issue while processing your booking. Please try again in a few minutes, or check your internet connection.
          </p>

          <p className="text-[#666] text-[14px] sm:text-[16px] leading-[24px] mb-6 font-sans">
            If the problem continues, Just contact our team and we&apos;ll help you sort it out quickly.
          </p>

          <a
            href="tel:+233576093838"
            className="text-[#222] text-[16px] sm:text-[18px] font-bold font-sans hover:underline inline-block mb-6"
          >
            +233 576 093 838
          </a>

          {/* Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-[#ff5e00] text-white py-3 rounded-lg font-bold text-[16px] hover:bg-[#e55500] transition-colors font-sans"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

