import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import TourLoader from "../components/TourLoader";
import { NO_INDEX_ROBOTS } from "../lib/seo/site";

export const metadata: Metadata = {
  title: "Reset Password | Sabary Tours",
  robots: NO_INDEX_ROBOTS,
};

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <TourLoader />
      </div>
    }>
      <ResetPasswordPage />
    </Suspense>
  );
}

