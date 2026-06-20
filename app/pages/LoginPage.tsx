"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserIcon, LockIcon, EyeIcon, Mail01Icon } from "hugeicons-react";
import AuthCarousel from "../components/AuthCarousel";
import WhyRegisterPopup from "../components/WhyRegisterPopup";
import Logo from "../components/Logo";
import { createClient } from "../utils/supabase/client";
import { isAdminRole } from "../lib/adminPermissions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const togglePassword = () => setShowPassword((prev) => !prev);

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
    setFieldErrors({});

    try {
      if (!formData.email || !formData.password) {
        setError("Please enter both email and password.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Check role for proper redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      const redirectUri = new URLSearchParams(window.location.search).get("redirect");
      const defaultRedirect = isAdminRole(profile?.role) ? '/admin' : '/dashboard';
      router.push(redirectUri || defaultRedirect);
      router.refresh(); // Important: Refresh server state
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Mock Google login - replace with actual OAuth later
      setLoading(true);
      setTimeout(() => {
        const mockResponse = {
          token: "mock_google_token_" + Date.now(),
          user: {
            id: "1",
            email: "user@gmail.com",
            firstName: "Google",
            lastName: "User",
            username: "googleuser",
          },
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("token", mockResponse.token);
          localStorage.setItem("user", JSON.stringify(mockResponse.user));
        }
        router.push("/dashboard");
      setLoading(false);
      }, 500);
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
                Welcome back!
              </h1>
              <p className="text-gray-600 font-semibold text-[14px]">
                Log in to your account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {fieldErrors.password && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {fieldErrors.password}
              </div>
            )}

            <div className="space-y-3">
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
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-[#ff5e00] text-[12px] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 text-white rounded-full shadow-md transition-all hover:cursor-pointer font-medium bg-[#ff5e00] hover:bg-[#e55500] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-center font-sans text-[14px] text-white">
                {loading ? "Logging in..." : "Log in"}
              </span>
            </button>

            <div className="text-center">
              <p className="text-gray-600 font-sans text-[14px]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#ff5e00] hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4 px-4 font-sans">
          By logging in, you agree to our{" "}
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

