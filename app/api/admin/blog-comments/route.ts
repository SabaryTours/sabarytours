import { NextResponse } from "next/server";
import { adminAuthErrorResponse, requireAdminPermission, supabaseAdmin } from "../../../lib/adminAuth";

export async function GET() {
  try {
    const auth = await requireAdminPermission("content");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const { data, error } = await supabaseAdmin
      .from("blog_comments")
      .select("id, post_id, post_slug, name, email, content, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, comments: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Error loading blog comments:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
