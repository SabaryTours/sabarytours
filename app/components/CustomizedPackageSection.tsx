import Link from "next/link";

export default function CustomizedPackageSection() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6">
      <div className="container mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0060cc] to-[#004a9e] px-6 sm:px-10 py-10 sm:py-12 text-center text-white">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
            }}
          />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <p className="text-sm font-bold uppercase tracking-wide text-white/90">
              Tailored for you
            </p>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl uppercase font-bold"
              style={{ fontFamily: "var(--font-unlimited-pie)" }}
            >
              Need a customized package?
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed font-sans">
              Tell us your group size, interests, dates, and budget — we&apos;ll design a
              seamless Ghana experience just for you.
            </p>
            <Link
              href="/customized-package"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#ff5e00] text-white font-bold font-sans hover:bg-[#e55500] transition-colors shadow-lg"
            >
              Request a customized tour
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
