"use client";

import { useSearchParams } from "next/navigation";
import { LockIcon } from "hugeicons-react";
import Logo from "../../components/Logo";

export default function ResetPasswordStartPage() {
  const searchParams = useSearchParams();
  const link = searchParams.get("link");

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#ff5e00]">
          <LockIcon size={32} />
        </div>
        <h1 
          className="text-2xl font-bold mb-4 uppercase"
          style={{ fontFamily: "var(--font-unlimited-pie)", textShadow: "2px 2px 0px #ddd" }}
        >
          Secure Password Reset
        </h1>
        <p className="text-gray-600 mb-8 text-[14px]">
          You requested to reset your password. Click the button below to securely continue to the reset page.
        </p>
        {link ? (
          <a
            href={link}
            className="block w-full py-3 px-4 bg-[#ff5e00] hover:bg-[#e55500] text-[14px] text-white rounded-full font-medium transition-colors shadow-md"
          >
            Continue to Reset Password
          </a>
        ) : (
          <p className="text-red-500 text-sm">Invalid link. Please request a new password reset.</p>
        )}
      </div>
    </div>
  );
}
