import PackagesGrid from "./PackagesGrid";

export default function Packages() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
      {/* Background Container - matching hero section structure */}
      <div 
        className="relative py-16 rounded-2xl overflow-visible"
        style={{
          backgroundColor: '#FEEFFF',
          borderRadius: '16px',
        }}
      >
        {/* Pattern Overlay - all over the section */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            backgroundImage: 'url(/assets/pattern.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
            opacity: 0.8,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            borderRadius: '16px',
          }}
        />
        
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
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
            <div className="flex flex-col md:flex-row gap-[12px] items-center leading-none uppercase w-full justify-center overflow-visible px-2">
              <h2 
                className="text-[32px] text-[#222] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1
                }}
              >
                go through
        </h2>
              <h2 
                className="text-[32px] text-[#ff5e00] relative"
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

          <PackagesGrid />
        </div>
      </div>
    </section>
  );
}

