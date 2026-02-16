"use client";

import Image from "next/image";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="w-full bg-[#1B0A00] relative pt-4 pb-8">
      {/* Decorative border pattern - triangles */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("/assets/pattern.svg")`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
        opacity: 0.8,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
        }}></div>

      <div className="w-[90%] mx-auto px-4 sm:px-6 relative z-10 bg-[#2E1100] rounded-2xl pt-6 sm:pt-8 pb-8 sm:pb-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Column 1: Sabary Tours */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-white text-[14px] font-normal leading-[24px] mb-4">
              A travel and tour company in Ghana...Slogan goes here!
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-white hover:text-[#ff5e00] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#ff5e00] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#ff5e00] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#ff5e00] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#ff5e00] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[#ff5e00] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-[16px] leading-[24px] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors">
                  About us
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors">
                  Our packages
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors">
                  Blogs and News
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-white font-bold text-[16px] leading-[24px] mb-4">Contact</h3>
            <ul className="space-y-2 text-white text-[14px] font-normal leading-[24px]">
              <li>NO. 30 2nd Nana Kantom Street, Off El Shadai Ln, Accra-Ghana.</li>
              <li>
                <a href="tel:+233576093838" className="underline hover:text-[#ff5e00] transition-colors">
                  +233 576 093 838
                </a>
              </li>
              <li>
                <a href="mailto:info@sabarytours.com" className="underline hover:text-[#ff5e00] transition-colors">
                  info@sabarytours.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white font-bold text-[16px] leading-[24px] mb-4">Newsletter</h3>
            <p className="text-white text-[14px] font-normal leading-[24px] mb-4">
              Get monthly updates in your inbox
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white text-[#222] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5e00]"
              />
              <button
                type="submit"
                className="bg-[#ff5e00] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#e55500] transition-colors flex items-center justify-center"
                style={{ minWidth: '48px' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Decorative SVG at bottom */}
        <div className="absolute bottom-0 left-0 w-full" style={{ height: '201px', overflow: 'hidden', pointerEvents: 'none' }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="1314" 
            height="201" 
            viewBox="0 0 1314 201" 
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="xMidYMax meet"
            style={{
              opacity: 1,
            }}
          >
            <g opacity="0.1">
              <path d="M1.23074 78.966C1.23074 103.689 131.119 116.235 130.75 203.319C130.75 225.828 125.215 245.385 110.824 259.038C93.1117 276.012 63.5917 283.023 33.7027 283.023C0.123737 283.023 -34.1933 273.798 -50.7983 259.776L-44.1563 142.065C-22.3853 160.515 74.2927 212.913 87.2077 195.939C99.7537 178.965 44.7727 149.814 -17.9573 129.15C-111.314 98.154 -51.5363 -54.981 116.728 28.782L92.3737 109.224C82.0417 88.56 1.23074 54.612 1.23074 78.966Z" fill="rgba(216, 187, 170, 0.20)"/>
              <path d="M300.161 282.654L292.781 257.931H186.509L179.129 282.654H133.742L213.446 7.37999H265.844L345.917 282.654H300.161ZM210.494 175.275H268.796L239.645 74.907L210.494 175.275Z" fill="rgba(216, 187, 170, 0.20)"/>
              <path d="M567.974 138.744C593.804 150.921 605.981 173.43 605.981 208.116C605.981 290.034 515.945 285.975 400.817 280.44V279.702H385.688V3.69C500.447 -1.845 590.483 -5.90401 590.483 77.859C590.483 105.165 583.103 125.091 567.974 138.744ZM561.332 96.678C561.332 72.324 478.307 73.8 429.968 76.752V117.711C479.414 123.984 561.332 125.091 561.332 96.678ZM429.968 202.581C472.772 205.902 576.83 211.068 576.83 184.5C576.83 153.504 475.355 157.932 429.968 166.05V202.581Z" fill="rgba(216, 187, 170, 0.20)"/>
              <path d="M767.177 282.654L759.797 257.931H653.525L646.145 282.654H600.758L680.462 7.37999H732.86L812.933 282.654H767.177ZM677.51 175.275H735.812L706.661 74.907L677.51 175.275Z" fill="rgba(216, 187, 170, 0.20)"/>
              <path d="M1010.64 281.916L922.814 183.393C915.803 184.131 909.161 184.5 902.519 184.869V281.916H852.704V3.321H877.427V2.58299C884.069 2.58299 889.973 2.95201 896.246 3.321H902.519C1011 8.487 1059.34 34.686 1059.34 101.475C1059.34 141.327 1022.81 162.36 980.747 173.43L1071.89 281.916H1010.64ZM902.888 45.756H902.519V103.32C927.242 103.32 1006.95 101.844 1006.58 74.538C1005.84 46.125 902.519 46.125 902.519 46.125L902.888 45.756Z" fill="rgba(216, 187, 170, 0.20)"/>
              <path d="M1374.12 37.269L1260.47 162.729V284.499H1213.24V168.264L1067.11 61.992L1137.59 0L1258.99 93.357L1340.91 9.22499L1374.12 37.269Z" fill="rgba(216, 187, 170, 0.20)"/>
            </g>
          </svg>
        </div>

        {/* Payment Methods */}
        <div className="container mx-auto relative z-10 border-t border-white/10">
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/70 text-[12px] sm:text-[13px] font-normal leading-[20px] text-center">
              We accept secure payments via the above methods
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {/* Visa */}
              {/* <div className="relative w-16 h-10 sm:w-20 sm:h-12 flex items-center justify-center">
                <Image
                  src="/assets/payments/visa.svg"
                  alt="Visa"
                  fill
                  className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                  unoptimized
                />
              </div> */}
              {/* Mastercard */}
              {/* <div className="relative w-16 h-10 sm:w-20 sm:h-12 flex items-center justify-center">
                <Image
                  src="/assets/payments/mastercard.svg"
                  fill
                  alt="Mastercard"
                  className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                  unoptimized
                />
              </div> */}

              <div className="relative w-20 h-12 sm:w-24 sm:h-14 flex items-center justify-center">
                <Image
                  src="/assets/paystack-logo.jpg"
                  fill
                  alt="Paystack"
                  className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                  unoptimized
                />
              </div>
            
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="container mx-auto pt-4 text-center relative z-10">
          <p className="text-white text-[14px] font-normal leading-[24px]">
            Copyright © 2025 Sabary tours. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}

