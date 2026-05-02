import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../utils/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AdminGate = { ok: true; userId: string } | { ok: false; response: NextResponse };

async function requireAdmin(): Promise<AdminGate> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, userId: user.id };
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { data, error } = await supabaseAdmin
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ images: data || [] });
}

type GalleryItem = { image_url: string; caption?: string | null; sort_order?: number };

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const items = body.items as GalleryItem[] | undefined;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    const rows = items
      .filter((i) => i && typeof i.image_url === "string" && i.image_url.trim())
      .map((i, idx) => ({
        image_url: i.image_url.trim(),
        caption: i.caption?.trim() || null,
        sort_order: typeof i.sort_order === "number" ? i.sort_order : idx,
      }));

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid image URLs" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("gallery_images").insert(rows).select();
    if (error) throw error;
    return NextResponse.json({ inserted: data?.length ?? 0, images: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Insert failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("gallery_images").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
