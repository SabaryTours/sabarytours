import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const y = parseInt(url.searchParams.get("year") || "", 10);
    const year = Number.isFinite(y) && y >= 2000 && y <= 2100 ? y : new Date().getFullYear();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trip_year_outline")
      .select("id, year, month, title, body, accent_color")
      .eq("year", year)
      .eq("is_published", true)
      .order("month", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ year, items: data || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to load outline";
    console.error("GET /api/trip-outline:", e);
    return NextResponse.json({ year: new Date().getFullYear(), items: [], error: msg }, { status: 500 });
  }
}
