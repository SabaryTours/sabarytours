import dynamic from "next/dynamic";

const BlogGrid = dynamic(() => import("./BlogGrid"), {
  loading: () => (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-3 border-[#ff5e00] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function Blog() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-2 sm:py-4 md:py-7 relative bg-white overflow-visible">
      {/* Pattern Overlay - all over the section */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/assets/pattern.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-8 sm:py-12 md:py-16">
        {/* Header Section */}
        <div className="flex flex-col gap-[20px] items-center mb-12 text-center md:text-left">
          {/* Top Line - Icon + Subtitle */}
          <div className="flex gap-[5px] items-center justify-center">
            {/* Blog Icon */}
            <div className="h-5 w-[14px] relative">
              <svg
                viewBox="0 0 14 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M7 0L0 4V18L7 22L14 18V4L7 0Z"
                  fill="#0060CC"
                />
              </svg>
              </div>
            <p className="text-[#0060cc] text-[14px] font-bold leading-[24px] ">
              Blogs, Articles, News
            </p>
                </div>

          {/* Main Heading */}
          <div className="flex flex-col md:flex-row gap-[12px] items-center leading-none uppercase w-full justify-center overflow-visible px-2">
            <h2 
              className="text-[26px] md:text-[32px] text-[#222] relative"
              style={{
                fontFamily: 'var(--font-unlimited-pie)',
                lineHeight: 1
              }}
            >
              Welcome to
            </h2>
            <h2 
              className="text-[26px] md:text-[32px] text-[#ff5e00] relative"
              style={{
                fontFamily: 'var(--font-unlimited-pie)',
                lineHeight: 1,
                textShadow: '1px 1px 0px #551f00'
              }}
            >
              our travel blog
            </h2>
              </div>
            </div>

        <BlogGrid limit={3} loadMoreHref="/blog" />
      </div>
    </section>
  );
}

