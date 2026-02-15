"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft01Icon } from "hugeicons-react";
import Header from "../components/Header";

export default function BookingErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourSlug = searchParams.get("tour");

  const handleRetry = () => {
    if (tourSlug) {
      router.push(`/booking?tour=${tourSlug}`);
    } else {
      router.push("/packages");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto max-w-md">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/packages")}
              className="text-[#666] hover:text-[#222] text-[14px] font-sans mb-4 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
              Back
            </button>
            <h1 
              className="text-[28px] sm:text-[32px] md:text-[36px] text-[#ff5e00] font-normal uppercase mb-2"
              style={{
                fontFamily: 'var(--font-unlimited-pie)',
                textShadow: '2px 2px 0px #331300',
              }}
            >
              Booking
            </h1>
          </div>

          {/* Content */}
          <div className="text-center">
            {/* Illustration */}
            <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-[#E4C19A] overflow-hidden relative">
              <Image
                src="/assets/error.png"
                alt="Booking error"
                fill
                className="object-cover"
                unoptimized
              />
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
            <button
              onClick={handleRetry}
              className="w-full bg-[#ff5e00] text-white py-3 rounded-lg font-bold text-[16px] hover:bg-[#e55500] transition-colors font-sans mb-4"
            >
              Try Again
            </button>

            <button
              onClick={() => router.push("/packages")}
              className="w-full bg-gray-200 text-[#222] py-3 rounded-lg font-bold text-[16px] hover:bg-gray-300 transition-colors font-sans"
            >
              Back to Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

