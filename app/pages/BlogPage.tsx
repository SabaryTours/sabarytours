import BlogGrid from "../components/BlogGrid";
import BlogTrendingSidebar from "../components/BlogTrendingSidebar";
import Footer from "../components/Footer";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="relative rounded-3xl overflow-hidden min-h-[400px] md:h-[450px] flex flex-col md:flex-row items-center w-full shadow-lg" style={{ backgroundColor: "#893300" }}>
          
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

          {/* Right Image Layer */}
          <div className="relative w-full h-[250px] md:absolute md:inset-y-0 md:right-0 md:w-[60%] md:h-full z-0 block">
            <img
              src="/assets/about-us.png"
              alt="Travel Blog Ghana"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Text Card Layer (Z-10 to overlap image & pattern) */}
          <div className="relative w-full md:absolute md:inset-0 z-10 flex items-center justify-center p-4 sm:p-8 md:p-0 h-[auto] md:h-full pointer-events-none">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-[90%] md:max-w-[450px] lg:max-w-[500px] pointer-events-auto md:absolute md:left-[40%] md:-translate-x-1/2">
              <h1
                className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[34px] xl:text-[38px] leading-[1.2] mb-4"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                <span className="text-[#222] uppercase mr-2">WELCOME TO</span>
                <span className="text-[#ff5e00] uppercase" style={{ textShadow: "1.5px 1.5px 0px #3f1a0b" }}>
                  YOUR GO-TO GUIDE
                </span>
              </h1>
              <p className="text-[#222] text-[13px] sm:text-[14px] md:text-[15px] font-bold leading-relaxed max-w-sm">
              for exploring Ghana’s beauty, culture, and hidden gems—packed with travel tips, unique experiences, and the best places to stay
              Clock it 😆
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          {/* Header Section */}
          <div className="flex flex-col gap-[20px] items-center mb-12">
            {/* Top Line - Subtitle */}
            <div className="flex gap-[5px] items-center justify-center">
              <p className="text-[#0060cc] text-[14px] font-bold leading-[24px]">
                Browse and read our latest blog posts
              </p>
            </div>

            {/* Main Heading */}
            <h2 
              className="text-[24px] sm:text-[28px] md:text-[32px] text-[#222] uppercase font-bold"
              style={{
                fontFamily: 'var(--font-unlimited-pie)',
                lineHeight: 1
              }}
            >
              LATEST POSTS
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <BlogGrid />
            </div>
            <div className="lg:col-span-1">
              <BlogTrendingSidebar />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}


