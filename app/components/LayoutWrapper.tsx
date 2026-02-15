"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Only show splash on initial page load
    if (isInitialLoad) {
      // Check if we're on the home page
      if (pathname === "/") {
        setShowSplash(true);
      }
      setIsInitialLoad(false);
    }
  }, [pathname, isInitialLoad]);

  // Show splash screen on initial home page load
  if (showSplash && pathname === "/") {
    return <SplashScreen>{children}</SplashScreen>;
  }

  return <>{children}</>;
}

