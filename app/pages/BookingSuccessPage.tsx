"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft01Icon } from "hugeicons-react";

export default function BookingSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
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
                textShadow: '1px 1px 0px #331300',
              }}
            >
              Booking
            </h1>
          </div>

          {/* Content */}
          <div className="text-center">
            {/* Illustration */}
            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full bg-[#FFDFCC] overflow-hidden">
              <Image
                src="/assets/success.png"
                alt="Booking successful"
                fill
                className="object-cover"
              />
            </div>

            {/* Success Message */}
            <h3 className="text-[#222] text-[24px] sm:text-[28px] font-bold mb-4 font-sans">
              You&apos;re all set!
            </h3>

            <p className="text-[#666] text-[14px] sm:text-[16px] leading-[24px] mb-2 font-sans">
              We&apos;ve sent an email with your booking details and payment information.
            </p>
            <p className="text-[#666] text-[14px] sm:text-[16px] leading-[24px] mb-6 font-sans">
              Kindly check your inbox (or spam folder, just in case).
            </p>

            <p className="text-[#666] text-[14px] sm:text-[16px] leading-[24px] mb-2 font-sans">
              If you have any questions or need help, feel free to reach out on:
            </p>
            <a
              href="tel:+233576093838"
              className="text-[#222] text-[16px] sm:text-[18px] font-bold font-sans hover:underline inline-block mb-8"
            >
              +233 576 093 838
            </a>

            <button
              onClick={() => router.push("/packages")}
              className="w-full bg-[#ff5e00] text-white py-3 rounded-lg font-bold text-[16px] hover:bg-[#e55500] transition-colors font-sans"
            >
              Browse More Tours
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

