import { NextResponse } from "next/server";
import { adminAuthErrorResponse, requireAdminPermission, supabaseAdmin } from "../../../lib/adminAuth";

export async function GET() {
  try {
    const auth = await requireAdminPermission("content");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const { data, error } = await supabaseAdmin
      .from("faqs")
      .select("*")
      .order("section_sort_order", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, faqs: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Error loading FAQs via Admin API:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminPermission("content");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const body = await request.json();
    const { faqInput, faqId } = body;

    if (!faqInput?.question || !faqInput?.answer || !faqInput?.section_title || !faqInput?.section_slug) {
      return NextResponse.json({ success: false, error: "Missing required FAQ fields" }, { status: 400 });
    }

    const payload = {
      ...faqInput,
      updated_at: new Date().toISOString(),
    };

    let finalId = faqId;

    if (finalId) {
      const { error } = await supabaseAdmin.from("faqs").update(payload).eq("id", finalId);
      if (error) throw error;
    } else {
      const { data: newItem, error } = await supabaseAdmin.from("faqs").insert(payload).select().single();
      if (error) throw error;
      finalId = newItem.id;
    }

    return NextResponse.json({ success: true, faqId: finalId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Error creating/updating FAQ via Admin API:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminPermission("content");
    if (!auth.ok) return adminAuthErrorResponse(auth);

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing FAQ ID" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("faqs").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    console.error("Error deleting FAQ via Admin API:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
