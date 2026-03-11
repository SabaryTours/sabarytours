const EXCHANGE_TTL_MS = 2 * 24 * 60 * 60 * 1000; // ~ every 2 days (~3x/week)

interface ExchangeRateApiResponse {
  result: string;
  base_code: string;
  time_last_update_unix: number;
  conversion_rates: Record<string, number>;
}

let serverCache: {
  base: string;
  fetchedAt: number;
  rates: Record<string, number>;
} | null = null;

export async function getExchangeRates(base: string = "USD") {
  const now = Date.now();

  // Server-side in-memory cache
  if (typeof window === "undefined") {
    if (serverCache && serverCache.base === base && now - serverCache.fetchedAt < EXCHANGE_TTL_MS) {
      return serverCache.rates;
    }
  } else {
    // Client-side localStorage cache
    const key = `exchange_rates_${base}`;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as { fetchedAt: number; rates: Record<string, number> };
        if (now - parsed.fetchedAt < EXCHANGE_TTL_MS) {
          return parsed.rates;
        }
      }
    } catch {
      // ignore JSON / storage issues
    }
  }

  const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_EXCHANGE_RATE_API_KEY");
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Exchange rate API error: ${res.status}`);
  }

  const data = (await res.json()) as ExchangeRateApiResponse;
  if (data.result !== "success") {
    throw new Error("Exchange rate API returned non-success result");
  }

  const rates = data.conversion_rates;

  // Update caches
  if (typeof window === "undefined") {
    serverCache = { base, fetchedAt: now, rates };
  } else {
    try {
      const key = `exchange_rates_${base}`;
      window.localStorage.setItem(key, JSON.stringify({ fetchedAt: now, rates }));
    } catch {
      // ignore storage failures
    }
  }

  return rates;
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
) {
  if (from === to) return amount;

  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    throw new Error(`Missing exchange rate for ${from} or ${to}`);
  }

  // Convert via base currency
  const amountInBase = amount / fromRate;
  return amountInBase * toRate;
}

