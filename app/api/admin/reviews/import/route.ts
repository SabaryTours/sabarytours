import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "../../../../lib/adminAuth";
import { upsertExternalReviews } from "../../../../lib/reviews/upsertExternal";
import type { ExternalReviewInput } from "../../../../lib/reviews/types";

const importItemSchema = z.object({
  id: z.string().optional(),
  externalId: z.string().optional(),
  name: z.string().min(1),
  rating: z.number().min(1).max(5),
  text: z.string().optional(),
  message: z.string().optional(),
  date: z.string().optional(),
  reviewedAt: z.string().optional(),
  image: z.string().optional(),
  imageUrl: z.string().optional(),
  profileUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
});

const bodySchema = z.object({
  source: z.enum(["tripadvisor", "google"]).default("tripadvisor"),
  reviews: z.array(importItemSchema).min(1).max(100),
});

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid import payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { source, reviews } = parsed.data;

    const mapped: ExternalReviewInput[] = reviews.map((r, index) => {
      const message = (r.message || r.text || "").trim();
      const externalId =
        r.externalId ||
        r.id ||
        `${source}-${r.name.replace(/\s+/g, "-").toLowerCase()}-${r.date || index}`;

      return {
        externalId,
        source,
        name: r.name.trim(),
        rating: r.rating,
        message: message || "Left a review.",
        imageUrl: r.imageUrl || r.image || null,
        sourceUrl: r.sourceUrl || r.profileUrl || null,
        reviewedAt: r.reviewedAt || r.date || null,
        position: source === "tripadvisor" ? "TripAdvisor" : "Google Review",
      };
    });

    const stats = await upsertExternalReviews(gate.supabaseAdmin, mapped, {
      autoApprove: true,
    });

    return NextResponse.json({
      ok: true,
      message: `Imported ${mapped.length} ${source} review(s).`,
      stats,
    });
  } catch (err) {
    console.error("Review import error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to import reviews",
      },
      { status: 500 }
    );
  }
}
