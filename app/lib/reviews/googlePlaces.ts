import type { ExternalReviewInput, GoogleSyncMeta } from "./types";

interface GooglePlacesReview {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  publishTime?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string;
  };
}

interface GooglePlaceDetails {
  reviews?: GooglePlacesReview[];
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

export async function fetchGooglePlaceReviews(
  placeId: string,
  apiKey: string
): Promise<{ reviews: ExternalReviewInput[]; meta: GoogleSyncMeta }> {
  const encodedPlaceId = encodeURIComponent(placeId.trim());
  const url = `https://places.googleapis.com/v1/places/${encodedPlaceId}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "reviews,rating,userRatingCount,googleMapsUri",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Google Places API error (${res.status}): ${errText.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as GooglePlaceDetails;
  const reviews: ExternalReviewInput[] = (data.reviews ?? []).map((r, index) => {
    const author = r.authorAttribution?.displayName?.trim() || "Google reviewer";
    const text =
      r.text?.text?.trim() ||
      r.originalText?.text?.trim() ||
      "";
    const externalId =
      r.name?.replace(/^places\/.*\/reviews\//, "") ||
      `google-${author}-${r.publishTime || index}`;

    return {
      externalId,
      source: "google" as const,
      name: author,
      rating: Math.min(5, Math.max(1, Math.round(r.rating ?? 5))),
      message: text || "Left a rating on Google.",
      imageUrl: r.authorAttribution?.photoUri || null,
      sourceUrl: r.authorAttribution?.uri || data.googleMapsUri || null,
      reviewedAt: r.publishTime || null,
      position: "Google Review",
    };
  });

  return {
    reviews,
    meta: {
      rating: data.rating,
      userRatingCount: data.userRatingCount,
      googleMapsUri: data.googleMapsUri,
    },
  };
}
