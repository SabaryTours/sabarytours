import HeroSearchForm from "./HeroSearchForm";

export default function Hero() {
  const featuredTour = {
    title: "Discover the Beauty of Ghana",
    image: "/assets/waterfall.png",
  };

  return (
    <section className="relative w-full h-[800px] sm:h-[750px] md:h-[700px] lg:h-[650px] xl:h-[600px] font-sans flex items-center justify-center">
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${featuredTour.image})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center mt-12 sm:mt-16 text-center">
        
        {/* Main Headline */}
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 sm:gap-6 mb-10 sm:mb-14 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-wider font-sans mb-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5e00] animate-pulse"></span>
            DISCOVER THE UNDISCOVERED
          </div>
          
          <h1 
            className="text-[28px] sm:text-[40px] md:text-[56px] lg:text-[64px] xl:text-[72px] text-white leading-[1] tracking-tight uppercase"
            style={{ 
              fontFamily: 'var(--font-unlimited-pie)',
              textShadow: '0 4px 24px rgba(0,0,0,0.5)'
            }}
          >
            {featuredTour.title}
          </h1>
          <div className="text-white text-[14px] sm:text-[16px] md:text-[18px] max-w-2xl font-sans mt-3 sm:mt-5 font-medium drop-shadow-md">
            We plan the trips, you make the memories. From waterfalls to street food, we take you beyond the brochures.
          </div>
        </div>

        {/* Floating Search Bar (Client Component) */}
        <HeroSearchForm />

        {/* Popular searches tags */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="text-white/80 text-sm font-medium font-sans">Popular:</span>
          {["Kakum National Park", "Boti Falls", "Cape Coast Castle", "Accra City Tour"].map((tag) => (
            <button key={tag} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium backdrop-blur-sm transition-all whitespace-nowrap">
              {tag}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
