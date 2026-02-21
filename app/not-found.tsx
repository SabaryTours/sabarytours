"use client";

import Link from 'next/link';
import { Home01Icon, ArrowLeft01Icon } from 'hugeicons-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 text-center overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-orange-50/30"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-[#ff5e00] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-1/3 right-10 w-32 h-32 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/2 w-48 h-48 bg-[#ff5e00] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-lg mx-auto">
        <h1 
          className="text-[120px] sm:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ff5e00] to-amber-500 leading-none drop-shadow-sm mb-4"
          style={{ fontFamily: 'var(--font-unlimited-pie)' }}
        >
          404
        </h1>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-sans mb-4 tracking-tight">
          Lost in the wild?
        </h2>
        
        <p className="text-gray-600 font-sans text-lg mb-10 max-w-md mx-auto leading-relaxed">
          The page you're searching for seems to have wandered off the map. Let's get you back to familiar territory.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 px-8 py-3.5 bg-[#ff5e00] text-white rounded-xl font-bold font-sans hover:bg-[#e55500] hover:shadow-lg hover:shadow-orange-500/30 transition-all w-full sm:w-auto justify-center"
          >
            <Home01Icon size={20} />
            Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold font-sans hover:border-gray-300 hover:bg-gray-50 transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft01Icon size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
