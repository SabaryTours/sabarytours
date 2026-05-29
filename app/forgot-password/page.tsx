import { Suspense } from "react";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import TourLoader from "../components/TourLoader";

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
