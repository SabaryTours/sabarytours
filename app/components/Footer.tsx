"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "./Logo";
import SocialMediaLinks from "./SocialMediaLinks";
import { useState } from "react";
import { formatCopyrightNotice } from "../lib/copyright";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Only passing the minimum required (plus fallback names) since Mailchimp requires FNAME/LNAME in some configs
        body: JSON.stringify({
          email,
          firstName: "Newsletter",
          lastName: "Subscriber", 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus("success");
      setMessage("Subscribed successfully!");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

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
            <div className="text-white text-[14px] font-normal leading-[24px] mb-4">
            For a lifetime experience, travel with Sabary.
            </div>
            <SocialMediaLinks variant="footer" />
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-[16px] leading-[24px] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors"
                >
                  Privacy &amp; terms
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/upcoming-tours"
                  className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors"
                >
                  Upcoming tours
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/faq#cancellations-refunds"
                  className="text-white text-[14px] font-normal leading-[24px] hover:text-[#ff5e00] transition-colors"
                >
                  Cancellations &amp; refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-white font-bold text-[16px] leading-[24px] mb-4">Contact</h3>
            <ul className="space-y-2 text-white text-[14px] font-normal leading-[24px]">
              <li>Greda Estate, 6th Avenue, Accra, Ghana.</li>
              <li>
                <a href="tel:+233576093838" className="underline hover:text-[#ff5e00] transition-colors">
                  +233 576 093 838
                </a>
              </li>
              <li>
                <a href="mailto:bookings@sabarytours.com" className="underline hover:text-[#ff5e00] transition-colors">
                  bookings@sabarytours.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white font-bold text-[16px] leading-[24px] mb-4">Newsletter</h3>
            <div className="text-white text-[14px] font-normal leading-[24px] mb-4">
              Get monthly updates in your inbox
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                required
                className="flex-1 px-4 py-2 rounded-lg bg-white text-[#222] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-[#ff5e00] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#e55500] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ minWidth: '48px' }}
              >
                {status === "loading" ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>
            {message && (
              <p className={`mt-2 text-[13px] ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
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
            <div className="text-white text-[12px] sm:text-[13px] font-normal leading-[20px] text-center">
              Secured by <b>paystack</b>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">

              <div className="relative w-20 h-12 sm:w-24 sm:h-14 flex items-center justify-center">
                <Image
                  src="/assets/paystack-logo.jpg"
                  fill
                  alt="Paystack"
                  className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="container mx-auto pt-4 text-center relative z-10">
          <div className="text-white text-[14px] font-normal leading-[24px]">
            {formatCopyrightNotice("Sabary tours", 2020)}
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}

