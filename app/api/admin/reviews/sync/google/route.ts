import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/adminAuth";
import { fetchGooglePlaceReviews } from "../../../../../lib/reviews/googlePlaces";
import { upsertExternalReviews } from "../../../../../lib/reviews/upsertExternal";

export async function POST() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      {
        error:
          "Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID in server environment variables.",
        setup:
          "Enable Places API (New) in Google Cloud Console, create an API key, and add your business Place ID.",
      },
      { status: 400 }
    );
  }

  try {
    const { reviews, meta } = await fetchGooglePlaceReviews(placeId, apiKey);
    const stats = await upsertExternalReviews(gate.supabaseAdmin, reviews, {
      autoApprove: true,
    });

    return NextResponse.json({
      ok: true,
      message: `Synced ${reviews.length} Google review(s).`,
      stats,
      meta,
      note:
        "Google Places API returns up to 5 reviews per sync. Re-sync periodically to refresh.",
    });
  } catch (err) {
    console.error("Google review sync error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to sync Google reviews",
      },
      { status: 500 }
    );
  }
}
