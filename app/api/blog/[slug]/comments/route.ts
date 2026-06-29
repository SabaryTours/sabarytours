import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { rateLimit } from "../../../../lib/rateLimit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const commentSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  content: z.string().min(3).max(1500),
});

type Context = { params: Promise<{ slug: string }> | { slug: string } };

export async function GET(_request: Request, context: Context) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const slug = params.slug;

  const { data, error } = await supabaseAdmin
    .from("blog_comments")
    .select("id, name, content, created_at")
    .eq("post_slug", slug)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[blog-comments] load:", error.message);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }

  return NextResponse.json({ comments: data || [] });
}

export async function POST(request: Request, context: Context) {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const slug = params.slug;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { ok } = rateLimit({ key: `blog-comment:${ip}:${slug}`, limit: 5, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json({ error: "Too many comments. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid comment" },
      { status: 400 },
    );
  }

  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("blog_comments").insert({
    post_id: post?.id != null ? String(post.id) : null,
    post_slug: slug,
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    content: parsed.data.content.trim(),
    status: "pending",
  });

  if (error) {
    console.error("[blog-comments] insert:", error.message);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Thanks! Your comment has been submitted and will appear once approved.",
  });
}
