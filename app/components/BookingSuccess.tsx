"use client";

import Link from "next/link";
import { getUserRole } from "../lib/authService";
import { useEffect, useState } from "react";

interface BookingSuccessProps {
  onClose: () => void;
}

export default function BookingSuccess({ onClose }: BookingSuccessProps) {
  const [dashboardUrl, setDashboardUrl] = useState("/login");

  useEffect(() => {
    const fetchRole = async () => {
      const role = await getUserRole();
      if (role === "admin") setDashboardUrl("/admin");
      else if (role === "subscriber") setDashboardUrl("/dashboard");
    };
    fetchRole();
  }, []);

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
              {/* Simplified thumbs up illustration */}
              <circle cx="50" cy="50" r="45" fill="#FFE5D4" />
              <path
                d="M35 45 L45 55 L65 35"
                stroke="#00A86B"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
            className="text-[#222] text-[16px] sm:text-[18px] font-bold font-sans hover:underline inline-block mb-6"
          >
            +233 576 093 838
          </a>

          <Link
            href={dashboardUrl}
            className="w-full block bg-[#ff5e00] text-white py-3 rounded-lg font-bold text-[16px] hover:bg-[#e55500] transition-colors font-sans"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

