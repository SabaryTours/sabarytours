"use client";

import { useEffect, useState } from "react";
import TripAdvisorWidget from "./TripAdvisorWidget";

interface SourcesSummary {
  google: {
    profileUrl: string | null;
    syncedCount: number;
    placeIdConfigured: boolean;
  };
  tripadvisor: {
    profileUrl: string | null;
    locationId: string | null;
    syncedCount: number;
  };
}

export default function ExternalReviewsBar() {
  const [sources, setSources] = useState<SourcesSummary | null>(null);

  useEffect(() => {
    fetch("/api/reviews/sources")
      .then((r) => r.json())
      .then(setSources)
      .catch(() => setSources(null));
  }, []);

  const googleUrl = sources?.google.profileUrl;
  const tripUrl = sources?.tripadvisor.profileUrl;

  return (
    <section className="mb-12 rounded-2xl border border-gray-100 bg-gradient-to-br from-[#fff7f0] to-white p-6 sm:p-8 shadow-sm">
      <h2
        className="text-xl sm:text-2xl font-bold text-gray-900 uppercase mb-2 text-center"
        style={{ fontFamily: "var(--font-unlimited-pie)" }}
      >
        Also rated on
      </h2>
      <p className="text-center text-gray-600 font-sans text-sm mb-6 max-w-xl mx-auto">
        See what travelers say about Sabary Tours on Google and TripAdvisor.
      </p>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        <div className="flex flex-col items-center gap-3 min-w-[200px]">
          <span className="text-sm font-bold text-gray-700 font-sans uppercase tracking-wide">
            Google
          </span>
          {googleUrl ? (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-800 hover:border-[#ff5e00] hover:text-[#ff5e00] transition-colors font-sans"
            >
              Read Google reviews
              {sources && sources.google.syncedCount > 0 && (
                <span className="text-xs text-gray-500">
                  ({sources.google.syncedCount} on site)
                </span>
              )}
            </a>
          ) : (
            <p className="text-xs text-gray-500 font-sans text-center">
              Add NEXT_PUBLIC_GOOGLE_REVIEWS_URL to link your profile
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 min-w-[240px]">
          <span className="text-sm font-bold text-gray-700 font-sans uppercase tracking-wide">
            TripAdvisor
          </span>
          <TripAdvisorWidget className="w-full" />
          {tripUrl && (
            <a
              href={tripUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#0060cc] hover:text-[#ff5e00] font-sans"
            >
              View on TripAdvisor →
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
