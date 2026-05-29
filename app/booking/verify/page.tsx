"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/bookings/verify?reference=${reference}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          if (data.invoice) {
            setMessage("Payment received! Thank you — a receipt has been sent to your email.");
            return;
          }
          setMessage("Payment verified! Redirecting to your booking confirmation...");
          setTimeout(() => {
            router.push(`/booking/success?ref=${reference}`);
          }, 1500);
        } else {
          setStatus("error");
          setMessage(data.error || "Payment verification failed. Please contact support.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please contact support with your payment reference.");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-[#ff5e00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-sans mb-2">Verifying Payment</h2>
            <p className="text-gray-500 font-sans">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#22c55e">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-sans mb-2">Payment Successful!</h2>
            <p className="text-gray-500 font-sans">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-sans mb-2">Verification Failed</h2>
            <p className="text-gray-500 font-sans mb-6">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-[#ff5e00] text-white px-6 py-3 rounded-xl font-bold font-sans hover:bg-[#e55500] transition-colors"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5e00] border-t-transparent rounded-full"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
