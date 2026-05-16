export type ReviewSource = "website" | "tour_comment" | "google" | "tripadvisor";

export interface ExternalReviewInput {
  externalId: string;
  source: ReviewSource;
  name: string;
  rating: number;
  message: string;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  reviewedAt?: string | null;
  position?: string | null;
}

export interface GoogleSyncMeta {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}
