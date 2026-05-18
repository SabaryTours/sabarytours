"use client";

import Script from "next/script";

const ELFSIGHT_APP_ID = "6ffc7377-3ec2-4e09-80bf-2aa6b95079cb";

interface ElfsightReviewsProps {
  className?: string;
  title?: string;
}

/**
 * Elfsight All-in-One Reviews widget (Google, TripAdvisor, etc. configured in Elfsight dashboard).
 */
export default function ElfsightReviews({
  className = "",
  title = "What travelers are saying",
}: ElfsightReviewsProps) {
  return (
    <section className={`font-sans ${className}`.trim()}>
      {title ? (
        <h2
          className="text-2xl sm:text-3xl font-bold text-[#222] uppercase text-center mb-8"
          style={{ fontFamily: "var(--font-unlimited-pie)" }}
        >
          {title}
        </h2>
      ) : null}
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div
        className={`elfsight-app-${ELFSIGHT_APP_ID} min-h-[200px]`}
        data-elfsight-app-lazy
      />
    </section>
  );
}
