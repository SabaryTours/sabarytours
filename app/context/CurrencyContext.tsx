"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getExchangeRates } from "../lib/exchangeRates";

type CurrencyCode = "USD" | "GHS";

interface CurrencyContextValue {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (code: CurrencyCode) => void;
  convert: (amount: number, baseCurrency: CurrencyCode) => number;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  // Load persisted currency selection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sabary_currency");
    if (stored === "USD" || stored === "GHS") {
      setCurrencyState(stored);
    }
  }, []);

  // Fetch exchange rates (USD base) with internal caching logic
  useEffect(() => {
    let cancelled = false;
    async function loadRates() {
      try {
        const data = await getExchangeRates("USD");
        if (!cancelled) {
          setRates(data);
        }
      } catch (e) {
        console.error("Failed to load exchange rates", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRates();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sabary_currency", code);
    }
  };

  const symbol = currency === "USD" ? "$" : "₵";

  const convert = (amount: number, baseCurrency: CurrencyCode): number => {
    if (!rates) return amount;
    if (currency === baseCurrency) return amount;

    const ghsPerUsd = rates["GHS"];
    if (!ghsPerUsd) return amount;

    // Rates object is USD-based: 1 USD = ghsPerUsd
    if (baseCurrency === "GHS" && currency === "USD") {
      // GHS -> USD
      return amount / ghsPerUsd;
    }
    if (baseCurrency === "USD" && currency === "GHS") {
      // USD -> GHS
      return amount * ghsPerUsd;
    }
    return amount;
  };

  const value: CurrencyContextValue = {
    currency,
    symbol,
    setCurrency,
    convert,
    loading,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}

