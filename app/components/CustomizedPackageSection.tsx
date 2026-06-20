import Link from "next/link";

export default function CustomizedPackageSection() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6">
      <div className="container mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-[#0060cc] to-[#004a9e] px-5 sm:px-8 py-7 sm:py-8 text-center text-white">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
            }}
          />
          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <p className="text-sm font-bold uppercase tracking-wide text-white/90">
              Tailored for you
            </p>
            <h2
              className="text-2xl sm:text-3xl uppercase font-bold"
              style={{ fontFamily: "var(--font-unlimited-pie)" }}
            >
              Plan a customized trip
            </h2>
            <p className="text-white/90 text-sm leading-relaxed font-sans">
              Share who&apos;s traveling, your interests, accommodation, and how you want
              to feel — we&apos;ll craft a tailored Ghana itinerary for you.
            </p>
            <Link
              href="/customized-package"
              data-analytics-cta="get_quote"
              data-analytics-location="home_custom_trip_banner"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#ff5e00] text-white text-sm font-bold font-sans hover:bg-[#e55500] transition-colors shadow-lg"
            >
              Plan your Ghana trip
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
