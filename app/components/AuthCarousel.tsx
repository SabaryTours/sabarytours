"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function AuthCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      id: 1,
      image: "/assets/tour-1.jpg",
      subtitle: "Discover the Heart of West Africa",
      title: "Welcome to",
      strongText: "Sabary Tours",
    },
    {
      id: 2,
      image: "/assets/tour-2.jpg",
      subtitle: "Adventure Awaits in Every Village",
      title: "Explore Ghana's",
      strongText: "Hidden Gems in Ghana",
    },
    {
      id: 3,
      image: "/assets/tour-3.jpg",
      subtitle: "Walk Through History & Culture",
      title: "Experience Sabary",
      strongText: "Like Never Before",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 1.1,
    },
    center: {
      opacity: 1,
      scale: 1,
      transition: { duration: 2 },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: { duration: 2 },
    },
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Background Image */}
          <motion.div
            className="h-full w-full relative"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
          >
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              className="object-cover"
              priority={currentSlide === 0}
            />
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Text Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-7">
          <div className="max-w-2xl text-white">
            <motion.h4
              className="text-xl md:text-2xl mb-2 font-sans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slides[currentSlide].subtitle}
            </motion.h4>
            <motion.h2
              className="text-2xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontFamily: "var(--font-unlimited-pie)",
                lineHeight: 1,
              }}
            >
              <span className="text-white">{slides[currentSlide].title} </span>
              <strong
                className="relative text-[#ff5e00]"
                style={{
                  textShadow: "3px 3px 0px #331300",
                }}
              >
                {slides[currentSlide].strongText}
              </strong>
            </motion.h2>
          </div>
        </div>
      </div>
    </div>
  );
}

