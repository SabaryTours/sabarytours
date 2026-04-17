export const EXCHANGE_TTL_MS = 2 * 24 * 60 * 60 * 1000; // ~ every 2 days (~3x/week)

interface ExchangeRateApiResponse {
  result: string;
  base_code: string;
  time_last_update_unix: number;
  conversion_rates: Record<string, number>;
}

export async function fetchLiveExchangeRates(base: string = "USD") {
  // Prefer server-only key; keep NEXT_PUBLIC fallback for compatibility.
  const apiKey =
    process.env.EXCHANGE_RATE_API_KEY || process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXCHANGE_RATE_API_KEY");
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

  return data.conversion_rates;
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

