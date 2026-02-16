import { Suspense } from "react";
import ResetPasswordPage from "../pages/ResetPasswordPage";

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-[#222] font-sans">Loading...</p>
      </div>
    }>
      <ResetPasswordPage />
    </Suspense>
  );
}

