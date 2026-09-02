import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface RouteContext {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const resolvedParams =
      context.params instanceof Promise ? await context.params : context.params;
    const slug = decodeURIComponent(resolvedParams.slug ?? "").trim();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const { data, error: updateError } = await supabaseAdmin.rpc("increment_published_post_view", {
      post_slug: slug,
    });

    if (updateError) {
      console.error("Failed to increment blog view:", updateError);
      const missingColumn = /view_count|increment_published_post_view/i.test(updateError.message);
      return NextResponse.json(
        {
          error: missingColumn
            ? "Blog view tracking is not enabled — apply the latest Supabase migrations."
            : "Failed to record view",
        },
        { status: 500 },
      );
    }

    const nextCount = typeof data === "number" ? data : Number(data);
    if (!Number.isFinite(nextCount)) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ views: nextCount }, { status: 200 });
  } catch (err) {
    console.error("Blog view API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
