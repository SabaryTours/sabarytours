import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { EXCHANGE_TTL_MS, fetchLiveExchangeRates } from "../../lib/exchangeRates";

type CacheRow = {
  base_code: string;
  rates: Record<string, number>;
  fetched_at: string;
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const memoryCache = new Map<
  string,
  { rates: Record<string, number>; fetchedAt: number }
>();

function validBase(base: string) {
  return /^[A-Z]{3}$/.test(base);
}

export async function GET(request: NextRequest) {
  try {
    const base = (request.nextUrl.searchParams.get("base") || "USD").toUpperCase();
    if (!validBase(base)) {
      return NextResponse.json({ error: "Invalid base currency" }, { status: 400 });
    }

    const now = Date.now();
    const mem = memoryCache.get(base);
    if (mem && now - mem.fetchedAt < EXCHANGE_TTL_MS) {
      return NextResponse.json(
        { base, rates: mem.rates, fetchedAt: mem.fetchedAt, source: "memory-cache" },
        {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" },
        }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("exchange_rates_cache")
      .select("base_code, rates, fetched_at")
      .eq("base_code", base)
      .maybeSingle();

    const row = data as CacheRow | null;
    const fetchedAt = row?.fetched_at ? new Date(row.fetched_at).getTime() : 0;
    const isFresh = !!row && now - fetchedAt < EXCHANGE_TTL_MS;

    if (!error && isFresh) {
      memoryCache.set(base, { rates: row.rates, fetchedAt });
      return NextResponse.json(
        { base, rates: row.rates, fetchedAt, source: "db-cache" },
        {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" },
        }
      );
    }

    const freshRates = await fetchLiveExchangeRates(base);
    const freshFetchedAtIso = new Date(now).toISOString();

    // Upsert shared cache row; ignore DB failures and still serve fresh rates.
    await supabaseAdmin.from("exchange_rates_cache").upsert(
      {
        base_code: base,
        rates: freshRates,
        fetched_at: freshFetchedAtIso,
      },
      { onConflict: "base_code" }
    );

    memoryCache.set(base, { rates: freshRates, fetchedAt: now });

    return NextResponse.json(
      { base, rates: freshRates, fetchedAt: now, source: "live-api" },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load exchange rates";
    console.error("Exchange rates API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

