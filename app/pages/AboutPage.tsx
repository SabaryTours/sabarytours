"use client";

import Image from "next/image";
import Footer from "../components/Footer";
import { teamMembers } from "../data/team";
import { useEffect, useRef, useState } from "react";

function CircularImageCard({ item, isMobile = false }: { item: { src: string; alt: string; hasLogo?: boolean; hasHeart?: boolean }; isMobile?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsInView(true);
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <div
      ref={cardRef}
      className="relative shrink-0 snap-center transition-all duration-300"
      style={{
        transform: isInView ? "scale(1)" : "scale(0.9)",
        opacity: isInView ? 1 : 0.7,
      }}
    >
      <div className={`relative rounded-full overflow-hidden border-4 border-white shadow-xl ${isMobile ? "w-64 h-64" : "w-48 h-48"}`}>
        <Image
          src={item.src}
          alt={item.alt}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      {item.hasLogo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-full px-4 py-2">
            <span className="text-[#0060CC] text-[12px] font-bold">
              Sabary Tours
            </span>
          </div>
        </div>
      )}
      {item.hasHeart && (
        <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#ff5e00"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}
    </div>
  );
}

function TeamMemberCard({ member, isMobile = false }: { member: typeof teamMembers[0]; isMobile?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsInView(true);
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <div
      ref={cardRef}
      className={`overflow-hidden relative rounded-[16px] bg-white shadow-lg shrink-0 snap-center transition-all duration-300 ${
        isMobile
          ? "h-[320px] w-[280px]"
          : "sm:h-[250px] md:h-[280px] lg:h-[310px] sm:w-[220px] md:w-[240px] lg:w-[260px]"
      }`}
      style={{
        transform: isInView ? "scale(1)" : "scale(0.9)",
        opacity: isInView ? 1 : 0.7,
      }}
    >
      {/* Image Container */}
      <div className="absolute inset-0">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      {/* Progressive Blur Overlay with Gradual Fade */}
      <div className={`absolute bottom-0 left-0 right-0 overflow-hidden ${isMobile ? "h-[80px]" : "sm:h-[90px] md:h-[100px] lg:h-[110px]"}`}>
        {/* Gradient mask for gradual fade */}
        <div className="absolute inset-0 team-blur-fade pointer-events-none" />
        {/* Member Info Card */}
        <div className={`absolute left-1/2 -translate-x-1/2 bg-[#222] flex flex-col items-start rounded-[6px] ${
          isMobile
            ? "bottom-[6px] gap-[6px] p-[6px] w-[220px]"
            : "sm:bottom-[7px] md:bottom-[8px] sm:gap-[7px] md:gap-[8px] sm:p-[7px] md:p-[8px] sm:w-[180px] md:w-[200px] lg:w-[220px]"
        }`}>
          <div className="text-white text-[14px] font-bold leading-[24px] w-full font-sans truncate">
            {member.name}
          </div>
          <div className="text-[#d4d3d4] text-[14px] font-normal leading-[24px] w-full font-sans truncate">
            {member.title}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero/Story Section - Blue Background */}
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
          <span className="text-[#222] uppercase">
            OUR STORY:{" "}
          </span>
          <span
            className="text-[#ff5e00] uppercase"
            style={{ textShadow: "3px 3px 0px #331300" }}
          >
            HOW IT ALL BEGAN
          </span>
        </h1>

        <p className="text-[#222] text-[15px] sm:text-[17px] md:text-[19px] font-bold leading-relaxed max-w-3xl mx-auto md:mx-0">
          It started with a single backpack and a heart full of curiosity...
        </p>

        {/* Thought Bubbles — Desktop Only */}
        <div className="hidden md:block">

          {/* Top Left */}
          <div className="absolute -top-10 -left-16">
            <div className="relative">
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-3 max-w-[220px]">
                <p className="text-[#ff5e00] text-sm font-bold">
                  will this work?!
                </p>
                <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
              </div>
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src="/assets/illu1.png"
                  alt="Team member"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Bottom Center */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative">
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-3 max-w-[260px]">
                <p className="text-[#9370DB] text-sm font-bold text-center">
                  Chale, you sure people go pay for this?
                </p>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
              </div>
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                <Image
                  src="/assets/illu2.png"
                  alt="Team member"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Top Right */}
          <div className="absolute -top-10 -right-16">
            <div className="relative">
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-3 max-w-[220px]">
                <p className="text-[#20B2AA] text-sm font-bold text-right">
                  how would we push this?
                </p>
                <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
              </div>
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg ml-auto">
                <Image
                  src="/assets/illu3.png"
                  alt="Team member"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>

      {/* Expanded Story Section - Orange Background */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#ff5e00" }}
        >
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-14 md:py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-white text-[16px] md:text-[16px] leading-[20px] mb-6 text-center">
                It started with a single backpack and a heart full of curiosity. Long before Sabary Tours became a business, it was just a way of life — finding joy in showing people around Ghana, from its humming cities to its quiet, soul-stirring coasts. The founder didn&apos;t set out to start a tour company. They were just that friend who knew the hidden spots, the market aunties, the best time to catch the golden light by the waterfalls.
              </div>
              <div className="text-white text-[16px] md:text-[16px] leading-[20px] mb-8 text-center">
                And somewhere between the early morning road trips and the shared jollof by the beach, the idea formed:
              </div>
              <h2
                className="text-[20px] sm:text-[22px] md:text-[24px] text-white font-normal leading-normal mb-12 uppercase text-center break-words overflow-wrap-anywhere px-4"
                style={{
                  fontFamily: "var(--font-unlimited-pie)",
                  textShadow: "0px 4px 0px #893300",
                  WebkitTextStroke: "1px #893300",
                } as React.CSSProperties}
              >
                what if more people could experience this?!
              </h2>
              {/* Three Tilted Image Cards */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-6 lg:gap-8 md:px-8 md:py-8">
                {/* Left Card */}
                <div className="w-full max-w-[280px] md:w-auto md:shrink-0 transition-transform duration-300 md:-rotate-6 md:hover:rotate-0" style={{ filter: 'drop-shadow(8px 8px 4px rgba(0, 0, 0, 1))' }}>
                  <div
                    className="flex flex-col items-center mx-auto md:mx-0"
                    style={{
                      width: '100%',
                      maxWidth: '280px',
                      height: '315px',
                      padding: '8px',
                      gap: '14px',
                      borderRadius: '12px',
                      background: '#FFF',
                    }}
                  >
                    <div
                      className="relative w-full rounded-[14px] overflow-hidden shrink-0"
                      style={{
                        backgroundColor: '#333131',
                        height: '242px',
                        maxHeight: '242px',
                      }}
                    >
                      <Image
                        src="/assets/about-img1.jpg"
                        alt="Travel should feel personal"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p
                      className="text-[#222] text-[16px] font-bold text-center leading-[20px] shrink-0"
                      style={{
                        fontFamily: 'var(--font-quicksand)',
                      }}
                    >
                      Travel should feel personal :)
                    </p>
                  </div>
                </div>
                {/* Middle Card */}
                <div className="w-full max-w-[280px] md:w-auto md:shrink-0 transition-transform duration-300" style={{ filter: 'drop-shadow(8px 8px 4px rgba(0, 0, 0, 1))' }}>
                  <div
                    className="flex flex-col items-center mx-auto md:mx-0"
                    style={{
                      width: '100%',
                      maxWidth: '280px',
                      height: '315px',
                      padding: '8px',
                      gap: '14px',
                      borderRadius: '12px',
                      background: '#FFF',
                    }}
                  >
                    <div
                      className="relative w-full rounded-[14px] overflow-hidden shrink-0"
                      style={{
                        backgroundColor: '#333131',
                        height: '242px',
                        maxHeight: '242px',
                      }}
                    >
                      <Image
                        src="/assets/about-img2.jpg"
                        alt="Crafted by locals"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p
                      className="text-[#222] text-[16px] font-bold text-center leading-[20px] shrink-0 w-full"
                      style={{
                        fontFamily: 'var(--font-quicksand)',
                      }}
                    >
                      Crafted by locals who know and love the land
                    </p>
                  </div>
                </div>
                {/* Right Card */}
                <div className="w-full max-w-[280px] md:w-auto md:shrink-0 transition-transform duration-300 md:rotate-6 md:hover:rotate-0" style={{ filter: 'drop-shadow(8px 8px 4px rgba(0, 0, 0, 1))' }}>
                  <div
                    className="flex flex-col items-center mx-auto md:mx-0"
                    style={{
                      width: '100%',
                      maxWidth: '280px',
                      height: '315px',
                      padding: '8px',
                      gap: '14px',
                      borderRadius: '12px',
                      background: '#FFF',
                    }}
                  >
                    <div
                      className="relative w-full rounded-[14px] overflow-hidden shrink-0"
                      style={{
                        backgroundColor: '#333131',
                        height: '242px',
                        maxHeight: '242px',
                      }}
                    >
                      <Image
                        src="/assets/about-img3.jpg"
                        alt="Made just for you"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p
                      className="text-[#222] text-[16px] font-bold text-center leading-[20px] shrink-0 w-full"
                      style={{
                        fontFamily: 'var(--font-quicksand)',
                      }}
                    >
                      So every journey feels like it was made just for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth/Mission Section - Blue Background */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#0060CC" }}
        >
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-14 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2
                className="text-[24px] sm:text-[28px] text-white font-normal leading-normal mb-8 uppercase text-center break-words"
                style={{
                  fontFamily: "var(--font-unlimited-pie)",
                  textShadow: '1px 1px 0px #893300',
                  WebkitTextStroke: "1px #893300",
                } as React.CSSProperties}
              >
                Today, we&apos;re still growing
              </h2>
              <div className="text-white text-[16px] md:text-[18px] leading-[28px] mb-12">
                We now host travelers from across the world. Sabary Tours wants to become the preferred tourism and hospitality company for travelers worldwide, offering unforgettable Ghanaian experiences with warmth, care, and local insight.
              </div>
              {/* Three Circular Images */}
              {/* Mobile: Horizontal Scroll */}
              <div className="md:hidden flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4">
                {[
                  { src: "/assets/tour-1.jpg", alt: "Tour photo", hasLogo: true },
                  { src: "/assets/tour-2.jpg", alt: "Tour photo", hasHeart: true },
                  { src: "/assets/tour-3.jpg", alt: "Tour photo", hasHeart: true },
                ].map((item, index) => (
                  <CircularImageCard key={index} item={item} isMobile={true} />
                ))}
              </div>
              {/* Desktop: Grid Layout */}
              <div className="hidden md:flex flex-wrap justify-center gap-8">
                <div className="relative">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <Image
                      src="/assets/tour-1.jpg"
                      alt="Tour photo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {/* Logo Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full px-4 py-2">
                      <span className="text-[#0060CC] text-[12px] font-bold">
                        Sabary Tours
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <Image
                      src="/assets/tour-2.jpg"
                      alt="Tour photo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {/* Heart Icon */}
                  <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="#ff5e00"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <Image
                      src="/assets/tour-3.jpg"
                      alt="Tour photo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {/* Heart Icon */}
                  <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="#ff5e00"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - White Background */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
        <div className="relative rounded-2xl overflow-hidden bg-white">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-14 md:py-16">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-[12px] items-center justify-center leading-none mb-12">
                <h2
                  className="text-[28px] sm:text-[32px] font-normal uppercase"
                  style={{
                    fontFamily: "var(--font-unlimited-pie)",
                    color: "#222",
                    lineHeight: 1,
                  }}
                >
                  the people
                </h2>
                <h2
                  className="text-[28px] sm:text-[32px] font-normal uppercase"
                  style={{
                    fontFamily: "var(--font-unlimited-pie)",
                    color: "#ff5e00",
                    textShadow: "1px 1px 0px #551f00",
                    lineHeight: 1,
                  }}
                >
                  who make it happen
                </h2>
              </div>
              {/* Mobile: Horizontal Scroll */}
              <div className="md:hidden flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4">
                {teamMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} isMobile={true} />
                ))}
              </div>
              {/* Desktop: Grid Layout */}
              <div className="hidden md:flex flex-wrap md:flex-nowrap justify-center gap-3 sm:gap-4 items-center w-full">
                {teamMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} isMobile={false} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
