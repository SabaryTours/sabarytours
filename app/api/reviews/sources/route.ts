import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

/** Public summary of external review sources for the reviews page. */
export async function GET() {
  try {
    const supabase = await createClient();

    const { count: googleCount } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("source", "google");

    const { count: tripadvisorCount } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("source", "tripadvisor");

    return NextResponse.json({
      google: {
        profileUrl: process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL || null,
        syncedCount: googleCount ?? 0,
        placeIdConfigured: Boolean(process.env.GOOGLE_PLACE_ID),
      },
      tripadvisor: {
        profileUrl: process.env.NEXT_PUBLIC_TRIPADVISOR_URL || null,
        locationId: process.env.NEXT_PUBLIC_TRIPADVISOR_LOCATION_ID || null,
        syncedCount: tripadvisorCount ?? 0,
      },
    });
  } catch (err) {
    console.error("Review sources error:", err);
    return NextResponse.json(
      { error: "Failed to load review sources" },
      { status: 500 }
    );
  }
}
