import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

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

    const supabase = await createClient();

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id, view_count")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const nextCount = (post.view_count ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("posts")
      .update({ view_count: nextCount })
      .eq("id", post.id);

    if (updateError) {
      console.error("Failed to increment blog view:", updateError);
      return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
    }

    return NextResponse.json({ views: nextCount }, { status: 200 });
  } catch (err) {
    console.error("Blog view API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
