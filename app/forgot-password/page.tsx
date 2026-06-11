import type { Metadata } from "next";
import { Suspense } from "react";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import TourLoader from "../components/TourLoader";
import { NO_INDEX_ROBOTS } from "../lib/seo/site";

export const metadata: Metadata = {
  title: "Forgot Password | Sabary Tours",
  robots: NO_INDEX_ROBOTS,
};

export default function ForgotPassword() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <TourLoader />
        </div>
      }
    >
      <ForgotPasswordPage />
    </Suspense>
  );
}
