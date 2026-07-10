"use client";

import { useEffect, useState } from "react";
import { CheckmarkBadge01Icon, Tag01Icon, Ticket01Icon } from "hugeicons-react";

export default function WhyRegisterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show popup after 1.5 seconds if not previously dismissed in this session
    const dismissed = sessionStorage.getItem("why_register_dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem("why_register_dismissed", "true");
    }, 300); // Wait for exit animation
  };

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ff5e00] to-[#ff8c42] p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h3 className="text-white font-bold text-lg font-sans">Why Create an Account?</h3>
        <p className="text-white/90 text-sm font-sans mt-0.5">Unlock exclusive benefits instantly.</p>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <div className="flex gap-3">
          <div className="mt-0.5 bg-orange-50 p-1.5 rounded-lg text-[#ff5e00]">
            <CheckmarkBadge01Icon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 font-sans">Manage Bookings Easily</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-sans mt-0.5">
              View your past and upcoming tours, and download receipts in one place.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 bg-orange-50 p-1.5 rounded-lg text-[#ff5e00]">
            <Ticket01Icon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 font-sans">Earn Sabary Miles</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-sans mt-0.5">
              Collect points on every booking to redeem for future discounts.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 bg-orange-50 p-1.5 rounded-lg text-[#ff5e00]">
            <Tag01Icon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 font-sans">Exclusive Vouchers</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-sans mt-0.5">
              Get access to member-only promo codes for your next adventure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
