"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail01Icon, ArrowLeft01Icon } from "hugeicons-react";
import AuthCarousel from "../components/AuthCarousel";
import { forgotPassword, clearAuthSession } from "../lib/authService";
import Logo from "../components/Logo";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void clearAuthSession().catch(() => {
      // Ignore sign-out errors; user may already be logged out.
    });
  }, []);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "expired") {
      setError("That reset link has expired. Please request a new one below.");
    } else if (err) {
      setError(decodeURIComponent(err.replace(/\+/g, " ")));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email. Please try again.";
      if (/rate limit|too many requests|429/i.test(msg)) {
        setError(
          "Too many reset attempts. Please wait about an hour before trying again, or contact bookings@sabarytours.com for help."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex">
      <div className="hidden md:block w-1/2 h-full relative z-0">
        <AuthCarousel />
      </div>

      {/* Form Section */}
      <div className="md:w-1/2 w-full h-full flex flex-col justify-center items-center bg-white bg-opacity-95 z-10 overflow-y-auto">
        <div className="w-[85%] md:w-[57%] max-w-md bg-white p-6 md:p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="text-center text-gray-800">
              <h1
                className="font-bold text-2xl mb-2 uppercase"
                style={{
                  fontFamily: "var(--font-unlimited-pie)",
                  textShadow: "1px 1px 0px #ddd",
                }}
              >
                Forgot Password ?
              </h1>
              <p className="text-gray-600 font-semibold text-[14px]">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Email sent!</p>
                <p className="text-[12px]">
                  Check your inbox for password reset instructions. If you don&apos;t see it, check your spam folder.
                </p>
              </div>
            )}

            {!success ? (
              <>
                <div className="relative">
                  <Mail01Icon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full p-3 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-black shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-200 font-sans text-[14px]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 text-white rounded-full shadow-md transition-all hover:cursor-pointer font-medium bg-[#ff5e00] hover:bg-[#e55500] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-center font-sans text-[14px] text-white">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="py-3 text-center text-white rounded-full shadow-md transition-all hover:cursor-pointer font-medium bg-[#ff5e00] hover:bg-[#e55500] font-sans text-[14px]"
              >
                Back to Login
              </Link>
            )}

            <div className="text-center">
              <Link
                href="/login"
                className="text-[#ff5e00] text-[14px] hover:underline font-medium inline-flex items-center gap-2"
              >
                <ArrowLeft01Icon size={16} />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

