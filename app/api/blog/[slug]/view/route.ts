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

    const { data: post, error: fetchError } = await supabaseAdmin
      .from("posts")
      .select("id, view_count")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const nextCount = (post.view_count ?? 0) + 1;

    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({ view_count: nextCount })
      .eq("id", post.id);

    if (updateError) {
      console.error("Failed to increment blog view:", updateError);
      const missingColumn = /view_count/i.test(updateError.message);
      return NextResponse.json(
        {
          error: missingColumn
            ? "Blog view tracking is not enabled — run supabase/migrations/20250611_post_view_counts.sql in Supabase SQL Editor."
            : "Failed to record view",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ views: nextCount }, { status: 200 });
  } catch (err) {
    console.error("Blog view API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
