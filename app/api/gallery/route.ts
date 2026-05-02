import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gallery_images")
      .select("id, image_url, caption, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ images: data || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to load gallery";
    console.error("GET /api/gallery:", e);
    return NextResponse.json({ images: [], error: msg }, { status: 500 });
  }
}
