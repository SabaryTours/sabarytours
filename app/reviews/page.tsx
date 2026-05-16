"use client";

import Footer from "../components/Footer";
import TourComments from "../components/TourComments";
import ExternalReviewsBar from "../components/ExternalReviewsBar";

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-white font-sans flex flex-col">

      {/* 2. Page Hero Section */}
  <div
  className="relative pt-32 pb-20 overflow-hidden bg-bottom bg-cover"
  style={{
    backgroundImage: `url("/assets/waterfall.png")`,
  }}
>
  <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
    <div className="max-w-3xl mx-auto text-center space-y-6">
      <h1
        className="text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight uppercase"
        style={{ fontFamily: 'var(--font-unlimited-pie)' }}
      >
        Traveler <span className="text-[#ff5e00]">Reviews</span>
      </h1>

      <div className="text-lg md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
        Read real stories and experiences from our community of travelers. We'd love to hear your story too!
      </div>
    </div>
  </div>
</div>

      {/* 3. Global Comments Section (No tourSlug provided) */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 md:px-12 py-12">
        <ExternalReviewsBar />
        <TourComments />
      </div>

      {/* 4. Footer */}
      <Footer />
    </main>
  );
}
