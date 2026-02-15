"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const fullText = "WELCOME TO SABARY TOURS";
  const minDisplayTime = 3000; // Minimum 3 seconds after typing completes

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;
    let fadeTimeout: NodeJS.Timeout;
    const startTime = Date.now();

    // Typing animation
    let currentIndex = 0;
    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        typingTimeout = setTimeout(typeNextChar, 100); // Typing speed
      } else {
        // After typing is complete, wait for minimum display time
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        
        fadeTimeout = setTimeout(() => {
          setIsLoading(false);
        }, remaining);
      }
    };

    // Start typing
    typeNextChar();

    // Cursor blink animation
    cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      if (cursorInterval) clearInterval(cursorInterval);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.1,
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={{
              backgroundColor: '#ff5e00',
            }}
          >
            {/* Hero SVG Overlay */}
            <div className="absolute inset-0">
              <Image
                src="/assets/hero_svg.png"
                alt="Hero overlay"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Pattern Overlay */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(/assets/pattern.svg)',
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto',
                opacity: 0.3,
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
              }}
            />

            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 flex flex-col items-center justify-center px-4"
            >
              {/* Typed Text */}
              <motion.h1 
                className="text-white text-[36px] sm:text-[48px] md:text-[64px] font-normal leading-[1.2] mb-6 text-center"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                }}
              >
                {displayText}
                {showCursor && (
                  <motion.span 
                    className="inline-block bg-white ml-2 align-middle"
                    style={{
                      width: '4px',
                      height: '1em',
                    }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.h1>

              {/* Feet Icon */}
              <div className="mt-4">
                <Image
                  src="/assets/feet.svg"
                  alt="Feet icon"
                  width={93}
                  height={78}
                  className="text-white"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Fade In */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, delay: isLoading ? 0 : 0.3 }}
        className={isLoading ? "pointer-events-none" : ""}
      >
        {children}
      </motion.div>
    </>
  );
}

