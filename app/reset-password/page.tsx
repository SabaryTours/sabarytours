import { Suspense } from "react";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import TourLoader from "../components/TourLoader";

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

