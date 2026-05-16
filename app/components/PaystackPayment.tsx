"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface PaystackPaymentProps {
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
  metadata?: Record<string, string | number | null>;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        metadata?: Record<string, string | number | null>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.PaystackPop) {
      resolve();
      return;
    }

    // Check if script tag already exists but hasn't loaded yet
    const existing = document.querySelector('script[src*="js.paystack.co"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack script")));
      // If it's already loaded (readyState check for edge cases)
      if (window.PaystackPop) resolve();
      return;
    }

    // Inject the script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
}

export default function PaystackPayment({
  amount,
  email,
  onSuccess,
  onError,
  metadata,
}: PaystackPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    loadPaystackScript()
      .then(() => setScriptReady(true))
      .catch(() => {
        console.warn("Paystack inline script could not be loaded, will use redirect fallback");
      });
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Initialize the transaction on the server
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to pesewas/kobo
          email,
          metadata,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Payment initialization failed");
      }

      const data = await response.json();

      // 2. Try inline popup first, fallback to redirect
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
          email,
          amount: Math.round(amount * 100), // Paystack expects pesewas/kobo
          ref: data.reference,
          metadata,
          callback: function (response: { reference: string }) {
            onSuccess(response.reference);
            setIsProcessing(false);
          },
          onClose: function () {
            onError("Payment window closed");
            setIsProcessing(false);
          },
        });
        handler.openIframe();
      } else {
        // Fallback: redirect to Paystack hosted checkout
        // The callback_url is set server-side in the initialize route
        window.location.href = data.authorization_url;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed. Please try again.";
      onError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-[#ff5e00] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[#222] text-[16px] font-bold font-sans mb-1">
              Secure Payment via Paystack
            </h3>
            <p className="text-[#666] text-[12px] font-normal font-sans">
              Your payment is secured and encrypted
            </p>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#0060CC">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span className="text-[#0060CC] text-[12px] font-semibold font-sans">Secure</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
          <span className="text-[#222] text-[14px] font-semibold font-sans">Amount to Pay</span>
          <span className="text-[#ff5e00] text-[20px] font-bold font-sans">
            GHS {amount.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-[#0060CC] text-white py-4 rounded-lg font-bold text-[16px] hover:bg-[#0052a3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Pay with Paystack
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="relative w-12 h-6">
            <Image
              src="/assets/payments/visa.svg"
              alt="Visa"
              fill
              className="object-contain opacity-60"
              onError={() => {}}
            />
          </div>
          <div className="relative w-12 h-6">
            <Image
              src="/assets/payments/mastercard.svg"
              alt="Mastercard"
              fill
              className="object-contain opacity-60"
              onError={() => {}}
            />
          </div>
          <div className="relative w-12 h-6">
            <Image
              src="/assets/payments/mobile-money.svg"
              alt="Mobile Money"
              fill
              className="object-contain opacity-60"
              onError={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
