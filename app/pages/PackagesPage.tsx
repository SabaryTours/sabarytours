import Image from "next/image";
import CategoryGrid from "../components/CategoryGrid";
import Footer from "../components/Footer";
import { createClient } from "../utils/supabase/server";

interface PackagesPageProps {
  searchQuery?: string;
  searchDate?: string;
}

export default async function PackagesPage({
  searchQuery = "",
  searchDate = "",
}: PackagesPageProps) {
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .order("created_at", { ascending: false });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPackages = normalizedQuery
    ? (packages || []).filter((pkg: any) => {
        const title = String(pkg.title || "").toLowerCase();
        const description = String(pkg.description || "").toLowerCase();
        const slug = String(pkg.slug || "").toLowerCase();
        return (
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          slug.includes(normalizedQuery)
        );
      })
    : packages || [];

  return (
    <div className="min-h-screen bg-white overflow-visible">
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="relative rounded-3xl overflow-hidden bg-[#fbebf4] min-h-[400px] md:h-[450px] flex flex-col md:flex-row items-center w-full shadow-lg">
          
          {/* Pattern Overlay Layer 1 */}
          <div
            className="absolute inset-y-0 left-0 w-full md:w-[40%] pointer-events-none z-0"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              opacity: 0.3,
              mixBlendMode: "overlay",
            }}
          />

          {/* Right Video Layer */}
          <div className="relative w-full h-[250px] md:absolute md:inset-y-0 md:right-0 md:w-[60%] md:h-full z-0 block">
            <video
              src="https://res.cloudinary.com/dg9ugeluw/video/upload/q_auto/f_auto/v1778775859/IMG_5101_un7at6.mov"
              autoPlay
              loop
              muted
              playsInline
              className="object-cover w-full h-full"
            />
          </div>

          {/* Text Card Layer */}
          <div className="relative w-full md:absolute md:inset-0 z-10 flex items-center justify-center p-4 sm:p-8 md:p-0 h-[auto] md:h-full pointer-events-none">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-[90%] md:max-w-[400px] lg:max-w-[450px] pointer-events-auto md:absolute md:left-[40%] md:-translate-x-1/2 text-center md:text-left">
              <h1
                className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[34px] xl:text-[38px] leading-[1.2] mb-6"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                <span className="text-[#ff5e00] uppercase block" style={{ textShadow: "1.5px 1.5px 0px #3f1a0b" }}>
                  FIND THE PERFECT PACKAGE
                </span>
              </h1>
              <p className="text-[#222] text-[13px] sm:text-[14px] md:text-[15px] font-bold leading-relaxed max-w-sm mx-auto md:mx-0">
                Pick what you need, mix and match, and let&apos;s make it happen.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Packages Section */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          {/* Header Section */}
          <div className="flex flex-col gap-[20px] items-center mb-12">
            {/* Top Line - Icon + Subtitle */}
            <div className="flex gap-[5px] items-center justify-center">
              {/* Road Trip Icon */}
              <div className="h-5 w-[25px] relative">
                <svg
                  viewBox="0 0 25 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  style={{ transform: 'scaleY(-1)' }}
                >
                  <path
                    d="M5 10C5 8.89543 5.89543 8 7 8H18C19.1046 8 20 8.89543 20 10V12C20 13.1046 19.1046 14 18 14H7C5.89543 14 5 13.1046 5 12V10Z"
                    fill="#0060CC"
                  />
                  <circle cx="8" cy="14" r="2" fill="#0060CC" />
                  <circle cx="17" cy="14" r="2" fill="#0060CC" />
                  <rect x="7" y="6" width="11" height="2" rx="1" fill="#0060CC" />
                </svg>
              </div>
              <p className="text-[#0060cc] text-[14px] font-bold leading-[24px]">
                Pick Your Adventure, We&apos;ll Handle the Rest
              </p>
            </div>

            {/* Main Heading */}
            <div className="flex flex-wrap gap-2 sm:gap-[12px] items-center leading-none uppercase w-full justify-center overflow-visible">
              <h2 
                className="text-[24px] sm:text-[28px] md:text-[32px] text-[#222] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1
                }}
              >
                go through
              </h2>
              <h2 
                className="text-[24px] sm:text-[28px] md:text-[32px] text-[#ff5e00] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1,
                  textShadow: '1px 1px 0px #551f00'
                }}
              >
                our packages
              </h2>
            </div>
          </div>

          {searchDate ? (
            <p className="mb-4 text-sm text-gray-500 font-sans text-center">
              Showing package results for date <span className="font-semibold">{searchDate}</span>.
            </p>
          ) : null}
          <CategoryGrid packages={filteredPackages} initialQuery={searchQuery} />
        </div>
      </section>
      <Footer />
    </div>
  );
}

