import { NextResponse } from "next/server";
import { adminAuthErrorResponse, requireAdminPermission, supabaseAdmin } from "../../../../lib/adminAuth";
import { syncBlogPostCommentCount } from "../../../../lib/blogCommentCounts";

type Context = { params: Promise<{ id: string }> | { id: string } };

export async function PATCH(request: Request, context: Context) {
  try {
    const auth = await requireAdminPermission("content");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const params = context.params instanceof Promise ? await context.params : context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing comment ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const status = body?.status;

    if (status !== "approved" && status !== "rejected" && status !== "pending") {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const { data: existing, error: loadError } = await supabaseAdmin
      .from("blog_comments")
      .select("id, post_id, post_slug, status")
      .eq("id", id)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("blog_comments")
      .update({ status })
      .eq("id", id)
      .select("id, post_id, post_slug, name, email, content, status, created_at")
      .single();

    if (error) throw error;

    if (existing.status !== status && (status === "approved" || existing.status === "approved")) {
      await syncBlogPostCommentCount(supabaseAdmin, existing.post_id, existing.post_slug);
    }

    return NextResponse.json({ success: true, comment: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Error updating blog comment:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const auth = await requireAdminPermission("content");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const params = context.params instanceof Promise ? await context.params : context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing comment ID" }, { status: 400 });
    }

    const { data: existing, error: loadError } = await supabaseAdmin
      .from("blog_comments")
      .select("id, post_id, post_slug, status")
      .eq("id", id)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin.from("blog_comments").delete().eq("id", id);
    if (error) throw error;

    if (existing.status === "approved") {
      await syncBlogPostCommentCount(supabaseAdmin, existing.post_id, existing.post_slug);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Error deleting blog comment:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
