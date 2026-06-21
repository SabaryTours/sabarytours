import Link from "next/link";

export default function CustomizedPackageSection() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6">
      <div className="container mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-[#0060cc] to-[#004a9e] px-5 sm:px-6 py-5 sm:py-6 text-white">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-4xl mx-auto">
            <div className="text-center sm:text-left space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/90 font-sans">
                Tailored for you
              </p>
              <h2
                className="text-lg sm:text-xl uppercase font-bold leading-tight"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                Plan a customized trip
              </h2>
              <p className="text-white/90 text-xs sm:text-sm leading-relaxed font-sans max-w-md">
                Share your dates, interests, and vibe — we&apos;ll craft a Ghana itinerary for you.
              </p>
            </div>
            <Link
              href="/customized-package"
              data-analytics-cta="get_quote"
              data-analytics-location="home_custom_trip_banner"
              className="inline-flex shrink-0 items-center justify-center self-center sm:self-auto px-5 py-2.5 rounded-full bg-[#ff5e00] text-white text-sm font-bold font-sans hover:bg-[#e55500] transition-colors shadow-lg"
            >
              Plan your Ghana trip
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
