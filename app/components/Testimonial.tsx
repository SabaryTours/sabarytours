"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const defaultTestimonials = [
  {
    name: "Nana Kwame",
    handle: "@nkwame_23",
    text: "Thanks for having me on this trip. I had an amazing time and sure would love to do it again!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  },
  {
    name: "Ama Serwaa",
    handle: "@amaserwaa_gh",
    text: "The best travel experience I've ever had! Sabary Tours made everything so easy and memorable.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    name: "Kofi Mensah",
    handle: "@kofi_mensah",
    text: "Absolutely incredible journey through Ghana. The guides were knowledgeable and the itinerary was perfect!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  },
  {
    name: "Efua Adjei",
    handle: "@efua_adjei",
    text: "From start to finish, everything was well organized. I'll definitely book with Sabary Tours again!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
  },
];

export default function Testimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<any[]>(defaultTestimonials);

  useEffect(() => {
    const fetchReviews = async () => {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (data && data.length > 0) {
        setTestimonials(data.map(r => ({
          name: r.name || 'Guest',
          handle: r.position ? `@${r.position.replace(/\s+/g, '').toLowerCase()}` : '@guest',
          text: r.message || '',
          image: r.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        })));
      }
    };
    fetchReviews();
  }, []);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials]);

  const currentTestimonial = testimonials[currentIndex] || defaultTestimonials[0];
  
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-2 sm:py-4 md:py-7 relative overflow-visible">
      {/* Background Container */}
      <div 
        className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-8 md:px-12 overflow-visible"
        style={{
          backgroundColor: '#ffdfcc',
          borderRadius: '16px',
        }}
      >
        {/* Decorative quotation marks */}
        <div className="absolute left-0 top-0 w-[117px] h-[75px] opacity-60">
          <Image
            src="/assets/top-quotes.svg"
            alt=""
            width={117}
            height={75}
            className="object-contain"
          />
        </div>
        <div className="absolute right-0 bottom-0 w-[117px] h-[75px] opacity-60">
          <Image
            src="/assets/bottom-quotes.svg"
            alt=""
            width={117}
            height={75}
            className="object-contain"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Header Section */}
          <div className="flex flex-col gap-[20px] items-center mb-12">
            {/* Top Line - Icon + Subtitle */}
            <div className="flex gap-[5px] items-center justify-center">
              {/* Chat Icon */}
              <div className="h-5 w-[16px] relative">
                <svg
                  viewBox="0 0 16 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8C0 10.5 1.25 12.75 3.25 14.25L2 20L7.75 16.5C7.92 16.5 8.08 16.5 8.25 16.5C12.67 16.5 16 13.17 16 8.75C16 4.33 12.67 0 8 0Z"
                    fill="#0060CC"
                  />
                  <circle cx="5" cy="8" r="1" fill="white" />
                  <circle cx="8" cy="8" r="1" fill="white" />
                  <circle cx="11" cy="8" r="1" fill="white" />
                </svg>
              </div>
              <p className="text-[#0060cc] text-[14px] font-bold leading-[24px]">
                Don&apos;t Just Take Our Word For It
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
                They came, they saw,
              </h2>
              <h2 
                className="text-[32px] text-[#ff5e00] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1,
                  textShadow: '1px 1px 0px #551f00'
                }}
              >
                they loved it!
              </h2>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="flex flex-col items-center max-w-[498px] mx-auto" style={{ gap: '32px' }}>
            {/* Profile Image */}
            <div 
              className="relative rounded-[20px] border-[5px] border-white overflow-hidden transition-opacity duration-500"
              key={`image-${currentIndex}`}
              style={{
                width: '172.877px',
                height: '172.877px',
                backgroundColor: '#333131',
              }}
            >
              <Image
                src={currentTestimonial.image}
                alt={currentTestimonial.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Testimonial Content */}
            <div 
              className="flex flex-col items-center text-center w-full transition-opacity duration-500"
              key={`content-${currentIndex}`}
              style={{ gap: '24px' }}
            >
              {/* "AMAZING!" Text */}
              <h3 
                className="text-[28px] uppercase h-[40px] flex items-center justify-center"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 'none',
                  color: '#ffffff',
                  textShadow: '1px 1px 0px #893300',
                }}
              >
                AMAZING!
              </h3>

              {/* Testimonial Text */}
              <p className="text-[#222] text-[16px] font-bold leading-[28px] h-[40px] flex items-center justify-center">
                {currentTestimonial.text}
              </p>

              {/* Name and Handle */}
              <p className="text-[14px] font-bold leading-[24px]">
                <span className="text-[#222]">{currentTestimonial.name} - </span>
                <span className="text-[#0060cc]">{currentTestimonial.handle}</span>
              </p>
            </div>

            {/* Progress Indicators */}
            <div className="flex gap-1.5 sm:gap-[10px] items-center justify-center px-2 flex-wrap max-w-full">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="bg-white rounded-md transition-all duration-300 hover:opacity-80"
                  style={{
                    width: index === currentIndex ? 'clamp(40px, 15vw, 137px)' : 'clamp(12px, 4vw, 40px)',
                    height: '4px',
                  }}
                  aria-label={`Go to testimonial ${index + 1}`}
                >
                  <div 
                    className="bg-[#ff5e00] rounded-md h-full transition-all duration-300"
                    style={{ width: '100%' }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

