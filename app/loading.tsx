"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#ff5e00]">
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets/pattern.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
          opacity: 0.1,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 drop-shadow-2xl"
      >
        <Image
          src="/assets/feet.svg"
          alt="Loading..."
          width={100}
          height={100}
          priority
        />
      </motion.div>
    </div>
  );
}
