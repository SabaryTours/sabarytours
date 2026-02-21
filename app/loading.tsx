"use client";

import TourLoader from "./components/TourLoader";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <TourLoader />
    </div>
  );
}
