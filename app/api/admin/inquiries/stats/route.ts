import { NextResponse } from "next/server";
import { requireAdminUser, supabaseAdmin } from "../../../../lib/adminAuth";

export async function GET() {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? "Unauthorized" : "Forbidden" }, { status: auth.status });
  }

  const { count, error } = await supabaseAdmin
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .in("status", ["new", "unread"]);

  if (error) {
    return NextResponse.json({ unread: 0 });
  }

  return NextResponse.json({ unread: count ?? 0 });
}
