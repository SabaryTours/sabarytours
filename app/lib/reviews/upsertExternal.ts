import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExternalReviewInput } from "./types";

function avatarForName(name: string): string {
  const colors = ["#ff5e00", "#893300", "#0ea5e9", "#10b981", "#f43f5e", "#8b5cf6"];
  const color = colors[name.length % colors.length];
  const initial = (name.charAt(0) || "G").toUpperCase();
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='${encodeURIComponent(color)}'/><text x='50' y='55' fill='white' font-family='sans-serif' font-size='40' font-weight='bold' text-anchor='middle'>${initial}</text></svg>`;
}

export async function upsertExternalReviews(
  supabase: SupabaseClient,
  reviews: ExternalReviewInput[],
  options?: { autoApprove?: boolean }
): Promise<{ inserted: number; updated: number; skipped: number }> {
  const autoApprove = options?.autoApprove ?? true;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const review of reviews) {
    if (!review.externalId || !review.name) {
      skipped += 1;
      continue;
    }

    const row = {
      name: review.name.trim(),
      rating: review.rating,
      message: review.message.trim() || "Left a rating.",
      image_url: review.imageUrl || avatarForName(review.name),
      source: review.source,
      external_id: review.externalId,
      source_url: review.sourceUrl ?? null,
      reviewed_at: review.reviewedAt ?? null,
      position: review.position ?? null,
      status: autoApprove ? "approved" : "pending",
      tour_slug: null,
    };

    const { data: existing, error: findError } = await supabase
      .from("reviews")
      .select("id")
      .eq("source", review.source)
      .eq("external_id", review.externalId)
      .maybeSingle();

    if (findError) {
      // Column may not exist yet — try insert without external_id
      if (findError.message?.includes("external_id")) {
        skipped += 1;
        continue;
      }
      throw findError;
    }

    if (existing?.id) {
      const { error } = await supabase.from("reviews").update(row).eq("id", existing.id);
      if (error) throw error;
      updated += 1;
    } else {
      const { error } = await supabase.from("reviews").insert(row);
      if (error) throw error;
      inserted += 1;
    }
  }

  return { inserted, updated, skipped };
}
