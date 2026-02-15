import BlogGrid from "../components/BlogGrid";
import Footer from "../components/Footer";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
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
                <span className="text-[#222] uppercase">WELCOME TO OUR</span>
                <br />
                <span className="text-[#ff5e00] uppercase" style={{ textShadow: "3px 3px 0px #331300" }}>
                  TRAVEL BLOG
                </span>
              </h1>
              <p className="text-[#222] text-[15px] sm:text-[17px] md:text-[19px] font-bold leading-relaxed max-w-3xl mx-auto md:mx-0">
                its dedicated to providing you travel tips, and amazing places you can tour or lodge within Ghana.
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

          <BlogGrid />
        </div>
      </section>
      <Footer />
    </div>
  );
}


