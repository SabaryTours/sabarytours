import { NextResponse } from "next/server";
import { adminAuthErrorResponse, requireAdminPermission, supabaseAdmin } from "../../../lib/adminAuth";

export async function GET() {
  try {
    const auth = await requireAdminPermission("marketing");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin] newsletter_subscribers:", error.message);
      return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
    }

    return NextResponse.json({ subscribers: data ?? [] });
  } catch (err) {
    console.error("[admin] newsletter-subscribers error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
