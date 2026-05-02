const features = [
  {
    title: "No Boring Tours Here!",
    description: "From hikes to heritage, it's all vibes and adventure in Ghana style.",
    bgColor: "#ff5e00", // Orange
    innerBgColor: "#fff0e8", // Creamy beige
    borderColor: "rgba(128,47,0,0.5)",
  },
  {
    title: "Your Trip, Your Style",
    description: "Whether you're here to explore, relax, or do both, we'll tailor your experience to fit you.",
    bgColor: "#0060CC", // Blue
    innerBgColor: "#E6F2FF", // Very light blue
    borderColor: "rgba(0,96,204,0.5)",
  },
  {
    title: "Comfort is Key",
    description: "Enjoy plush stays at places like Zaina Lodge and other handpicked gems.",
    bgColor: "#05A5DF", // Teal
    innerBgColor: "#E0F7F5", // Very light teal
    borderColor: "rgba(32,178,170,0.5)",
  },
  {
    title: "People Who Care",
    description: "Our team? Friendly, responsive, and always ready to make things smooth for you.",
    bgColor: "#893300", // Brown
    innerBgColor: "#F5E6D3", // Light brown/beige
    borderColor: "rgba(139,69,19,0.5)",
  },
  {
    title: "Travel That Gives Back",
    description: "Part of what you pay goes into supporting education in the communities we visit.",
    bgColor: "#222", // Dark gray/black
    innerBgColor: "#F5F5F5", // Light gray
    borderColor: "rgba(26,26,26,0.5)",
  },
  {
    title: "Book Small-Small",
    description: "We offer flexible payments so you can plan without pressure.",
    bgColor: "#9747FF", // Purple
    innerBgColor: "#F0E6FF", // Light purple
    borderColor: "rgba(147,112,219,0.5)",
  },
];

export default function WhyTravel() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
      {/* Blue Background Container - matching hero section structure */}
      <div className="bg-blue-50 relative rounded-2xl py-16 overflow-visible">
        <div className="container mx-auto px-4 sm:px-6">
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
                Travel Ghana, the Right Way
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
                Why travel
              </h2>
              <h2 
                className="text-[32px] text-[#ff5e00] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1,
                  textShadow: '1px 1px 0px #551f00'
                }}
              >
                with sabary?!
              </h2>
            </div>
          </div>

          {/* Cards: horizontal scroll on mobile, grid from md */}
          <div
            className="flex flex-row gap-6 overflow-x-auto overflow-y-visible pb-4 snap-x snap-mandatory scroll-pl-4 scroll-pr-4 -mx-1 px-1 [-webkit-overflow-scrolling:touch] overscroll-x-contain scrollbar-hide md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0 md:px-0 md:snap-none lg:grid-cols-3"
            role="list"
            aria-label="Why travel with Sabary"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative shrink-0 snap-start w-[min(88vw,360px)] max-w-[360px] rounded-2xl overflow-hidden flex items-center justify-center p-6 min-h-[200px] md:w-auto md:max-w-none md:min-w-0 md:shrink"
                style={{
                  backgroundColor: feature.bgColor,
                }}
                role="listitem"
              >
                {/* Pattern Overlay */}
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: "url(/assets/pattern.svg)",
                    backgroundRepeat: "repeat",
                    opacity: 0.2,
                    mixBlendMode: "overlay",
                  }}
                />

                {/* Inner Floating Card */}
                <div
                  className="relative z-10 bg-white rounded-xl px-6 py-8 flex flex-col gap-4 w-full max-w-[320px] text-center shadow-lg"
                  style={{
                    backgroundColor: feature.innerBgColor,
                    border: `1px solid ${feature.borderColor}`,
                  }}
                >
                  <h3 className="text-[#222] text-[22px] font-bold leading-[1.2]">
                    {feature.title}
                  </h3>

                  <p className="text-[#555] text-[15px] leading-[26px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

