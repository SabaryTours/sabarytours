"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockIcon, EyeIcon, ArrowLeft01Icon } from "hugeicons-react";
import AuthCarousel from "../components/AuthCarousel";
import { resetPassword } from "../lib/authService";
import Logo from "../components/Logo";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [searchParams]);

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

    if (!token) {
      setError("Invalid reset token");
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
                  textShadow: "2px 2px 0px #ddd",
                }}
              >
                Reset Password
              </h1>
              <p className="text-gray-600 font-semibold text-[14px]">
                Enter your new password
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Password reset successful!</p>
                <p className="text-[12px]">Redirecting to login...</p>
              </div>
            )}

            {!success && token && (
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
                  <p className="text-center font-sans text-[14px]">
                    {loading ? "Resetting..." : "Reset Password"}
                  </p>
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

