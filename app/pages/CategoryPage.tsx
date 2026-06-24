import { PackageCategory, Tour } from "../data/packages";
import CategoryToursSection from "../components/CategoryToursSection";
import Footer from "../components/Footer";

interface CategoryPageProps {
  category: PackageCategory;
  tours: Tour[];
}

export default function CategoryPage({ category, tours }: CategoryPageProps) {
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
                <span className="text-[#ff5e00] uppercase" style={{ textShadow: "3px 3px 0px #331300" }}>
                {category.title}
                </span>
              </h1>
              <p className="text-[#222] text-[15px] sm:text-[17px] md:text-[19px] font-bold leading-relaxed max-w-3xl mx-auto md:mx-0 whitespace-pre-line">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto max-w-6xl">
          {/* Header Section */}
          {/* <div className="flex flex-col gap-6 items-center mb-10">
   
            <h2 
              className="text-[24px] sm:text-[28px] md:text-[32px] text-[#222] font-normal uppercase"
              style={{
                fontFamily: 'var(--font-unlimited-pie)',
                // textShadow: '0px 4px 0px #fff',
                // WebkitTextStroke: '1px #fff',
              } as React.CSSProperties}
            >
              Options to pick from
            </h2>
          </div> */}

          <CategoryToursSection tours={tours} categorySlug={category.slug} />
        </div>
      </section>
      <Footer />
    </div>
  );
}

