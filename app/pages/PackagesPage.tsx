import Image from "next/image";
import CategoryGrid from "../components/CategoryGrid";
import Footer from "../components/Footer";
import { createClient } from "../utils/supabase/server";

export default async function PackagesPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase.from('packages').select('*').order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-white overflow-visible">
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="relative rounded-3xl overflow-hidden bg-[#2B7BD4]">
          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
            }}
          />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24">
            {/* Main Story Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 text-center md:text-left">
              <h1
                className="text-[22px] sm:text-[26px] md:text-[36px] lg:text-[42px] leading-tight mb-6"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                <span className="text-[#ff5e00] uppercase" style={{ textShadow: "3px 3px 0px #331300" }}>
                  FIND THE PERFECT PACKAGE
                </span>
              </h1>
              <p className="text-[#222] text-[15px] sm:text-[17px] md:text-[19px] font-bold leading-relaxed max-w-3xl mx-auto md:mx-0">
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

          <CategoryGrid packages={packages || []} />
        </div>
      </section>
      <Footer />
    </div>
  );
}

