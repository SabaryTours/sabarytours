import Image from "next/image";

// Partner logos - Add your partner logo images here
// Place images in /public/assets/partners/ directory
const partners = [
  {
    id: 1,
    name: "Dodi World",
    logo: "/assets/dodi-world.png", // Replace with actual logo path
    alt: "Partner 1 Logo",
  },
  {
    id: 2,
    name: "Villa Monticello",
    logo: "/assets/villa-monticello.png", // Replace with actual logo path
    alt: "Partner 2 Logo",
  },
  // {
  //   id: 3,
  //   name: "Dodi World",
  //   logo: "/assets/partners/partner3.png", // Replace with actual logo path
  //   alt: "Partner 3 Logo",
  // },
];

export default function Partners() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7 relative bg-white">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col gap-[20px] items-center mb-12">
          {/* Main Heading */}
          <div className="flex flex-col md:flex-row gap-[12px] items-center leading-none uppercase w-full justify-center overflow-hidden">
            <h2
              className="text-[32px] text-[#222] relative"
              style={{
                fontFamily: "var(--font-unlimited-pie)",
                lineHeight: 1,
              }}
            >
              Our
            </h2>
            <h2
              className="text-[32px] text-[#ff5e00] relative"
              style={{
                fontFamily: "var(--font-unlimited-pie)",
                lineHeight: 1,
                textShadow: "2px 2px 0px #551f00",
              }}
            >
              Partners
            </h2>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="relative w-full max-w-[180px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={partner.logo}
                alt={partner.alt}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

