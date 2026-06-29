import type { SupabaseClient } from "@supabase/supabase-js";

export async function syncBlogPostCommentCount(
  supabaseAdmin: SupabaseClient,
  postId: string | null | undefined,
  postSlug: string | null | undefined,
) {
  if (!postId && !postSlug) return;

  let countQuery = supabaseAdmin
    .from("blog_comments")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (postId) {
    countQuery = countQuery.eq("post_id", String(postId));
  } else if (postSlug) {
    countQuery = countQuery.eq("post_slug", postSlug);
  }

  const { count, error } = await countQuery;
  if (error) {
    console.error("[blog-comments] sync count:", error.message);
    return;
  }

  const nextCount = count ?? 0;

  if (postId) {
    await supabaseAdmin.from("posts").update({ comment_count: nextCount }).eq("id", postId);
  } else if (postSlug) {
    await supabaseAdmin.from("posts").update({ comment_count: nextCount }).eq("slug", postSlug);
  }
}
