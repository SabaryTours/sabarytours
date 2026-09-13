/** Shape returned by GET /api/reviews. */
export type PublicReview = {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  content: string;
  created_at: string;
  source?: string | null;
  position?: string | null;
};
