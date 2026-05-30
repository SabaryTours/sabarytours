"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockIcon, EyeIcon, ArrowLeft01Icon } from "hugeicons-react";
import AuthCarousel from "../components/AuthCarousel";
import { resetPassword } from "../lib/authService";
import { createClient } from "../utils/supabase/client";
import Logo from "../components/Logo";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function verifySession() {
      const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (accessToken && refreshToken && type === "recovery") {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setHasRecoverySession(false);
          setError("Your reset link is invalid or has expired. Please request a new one.");
          setCheckingSession(false);
          return;
        }

        window.history.replaceState(null, "", window.location.pathname);
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setHasRecoverySession(false);
        setError("Your reset link is invalid or has expired. Please request a new one.");
      } else {
        setHasRecoverySession(true);
        setError("");
      }
      setCheckingSession(false);
    }

    verifySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setHasRecoverySession(true);
        setError("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!hasRecoverySession) {
      setError("Your reset link is invalid or has expired. Please request a new one.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(formData.password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex">
      <div className="hidden md:block w-1/2 h-full relative z-0">
        <AuthCarousel />
      </div>

      <div className="md:w-1/2 w-full h-full flex flex-col justify-center items-center bg-white bg-opacity-95 z-10 overflow-y-auto">
        <div className="w-[85%] md:w-[57%] max-w-md bg-white p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="text-center text-gray-800">
              <h1
                className="font-bold text-2xl mb-2 uppercase"
                style={{
                  fontFamily: "var(--font-unlimited-pie)",
                  textShadow: "2px 2px 0px #ddd",
                }}
              >
                Reset Password
              </h1>
              <p className="text-gray-600 font-semibold text-[14px]">
                Enter your new password
              </p>
            </div>

            {checkingSession && (
              <p className="text-sm text-gray-500 text-center">Verifying your reset link...</p>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
                {!hasRecoverySession && (
                  <Link href="/forgot-password" className="block mt-2 text-[#ff5e00] font-semibold hover:underline">
                    Request a new reset link
                  </Link>
                )}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Password reset successful!</p>
                <p className="text-[12px]">Redirecting to login...</p>
              </div>
            )}

            {!success && !checkingSession && hasRecoverySession && (
              <>
                <div className="space-y-3">
                  <div className="relative">
                    <LockIcon
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="New Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-black shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-200 font-sans text-[14px]"
                      required
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                      onClick={togglePassword}
                    >
                      <EyeIcon size={18} className={showPassword ? "opacity-50" : ""} />
                    </div>
                  </div>

                  <div className="relative">
                    <LockIcon
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-black shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-200 font-sans text-[14px]"
                      required
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                      onClick={toggleConfirmPassword}
                    >
                      <EyeIcon size={18} className={showConfirmPassword ? "opacity-50" : ""} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 text-white rounded-full shadow-md transition-all hover:cursor-pointer font-medium bg-[#ff5e00] hover:bg-[#e55500] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-center font-sans text-[14px] text-white">
                    {loading ? "Resetting..." : "Reset Password"}
                  </span>
                </button>
              </>
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
