"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import { CurrencyProvider } from "../context/CurrencyContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Only show splash on initial page load
    if (isInitialLoad) {
      if (pathname === "/") {
        setShowSplash(true);
      }
      setIsInitialLoad(false);
    }
  }, [pathname, isInitialLoad]);

  return (
    <CurrencyProvider>
      {showSplash && pathname === "/" ? (
        <SplashScreen>{children}</SplashScreen>
      ) : (
        children
      )}
    </CurrencyProvider>
  );
}


