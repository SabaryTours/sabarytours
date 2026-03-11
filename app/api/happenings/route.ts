import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("now_happenings")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching happenings:", error);
      return NextResponse.json({ happenings: [], error: "Failed to load happenings" }, { status: 500 });
    }

    return NextResponse.json({ happenings: data ?? [] }, { status: 200 });
  } catch (err: any) {
    console.error("Happenings API error:", err);
    return NextResponse.json({ happenings: [], error: err?.message ?? "Internal error" }, { status: 500 });
  }
}

