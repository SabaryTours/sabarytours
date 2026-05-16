"use client";

import { CurrencyProvider } from "../context/CurrencyContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  );
}


