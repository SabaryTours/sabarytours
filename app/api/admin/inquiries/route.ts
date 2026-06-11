import { NextResponse } from "next/server";
import { requireAdminUser, supabaseAdmin } from "../../../lib/adminAuth";

export type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  type: string | null;
  status: string | null;
  created_at: string;
};

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? "Unauthorized" : "Forbidden" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  let query = supabaseAdmin
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (type === "general") {
    query = query.eq("type", "general");
  } else if (type === "customized_package") {
    query = query.eq("type", "customized_package");
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin/inquiries] list:", error.message);
    return NextResponse.json({ error: "Failed to load inquiries" }, { status: 500 });
  }

  return NextResponse.json({ inquiries: (data ?? []) as InquiryRecord[] });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? "Unauthorized" : "Forbidden" }, { status: auth.status });
  }

  const body = await request.json();
  const { id, status } = body as { id?: string; status?: string };

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("inquiries").update({ status }).eq("id", id);

  if (error) {
    console.error("[admin/inquiries] update:", error.message);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? "Unauthorized" : "Forbidden" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("inquiries").delete().eq("id", id);

  if (error) {
    console.error("[admin/inquiries] delete:", error.message);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
