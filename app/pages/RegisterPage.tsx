"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail01Icon, LockIcon, EyeIcon, UserIcon, CallIcon } from "hugeicons-react";
import AuthCarousel from "../components/AuthCarousel";
import WhyRegisterPopup from "../components/WhyRegisterPopup";
import { register } from "../lib/authService";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

    // Validation
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
      const response = await register(formData);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      // Supabase handles session persistence automatically.
      const redirectUri = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirectUri || "/dashboard?welcome=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
      <div className="md:w-1/2 w-full h-full flex flex-col justify-center items-center bg-white bg-opacity-95 z-10 overflow-y-auto py-8">
        <div className="w-[85%] md:w-[57%] max-w-md bg-white p-6 md:p-8">
        

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="text-center text-gray-800">
              <h1
                className="font-bold text-2xl mb-2 uppercase"
                style={{
                  fontFamily: "var(--font-unlimited-pie)",
                  textShadow: "1px 1px 0px #ddd",
                }}
              >
                Create Account
              </h1>
              <p className="text-gray-600 font-semibold text-[14px]">
                Join Sabary Tours today
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-black shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-200 font-sans text-[14px]"
                    required
                  />
                </div>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-black shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-200 font-sans text-[14px]"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Mail01Icon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-black shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-200 font-sans text-[14px]"
                  required
                />
              </div>

              <div className="relative">
                <CallIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone (Optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-black shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-200 font-sans text-[14px]"
                />
              </div>

              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
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
                  placeholder="Confirm Password"
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
                {loading ? "Creating account..." : "Create Account"}
              </span>
            </button>


            <div className="text-center">
              <p className="text-gray-600 font-sans text-[14px]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#ff5e00] hover:underline font-medium"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4 px-4 font-sans">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[#ff5e00]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-[#ff5e00]">
            Privacy Policy
          </Link>
        </div>
      </div>
      
      <WhyRegisterPopup />
    </div>
  );
}

