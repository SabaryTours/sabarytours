import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../utils/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("now_happenings")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ happenings: data ?? [] }, { status: 200 });
  } catch (err: any) {
    console.error("Admin happenings GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load happenings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, status, image_url, link_url, is_active, sort_order } =
      await request.json();

    if (!name || !image_url) {
      return NextResponse.json(
        { error: "Name and image are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("now_happenings")
      .insert({
        name,
        status: status || "ongoing",
        image_url,
        link_url: link_url || null,
        is_active: is_active ?? true,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ happening: data }, { status: 201 });
  } catch (err: any) {
    console.error("Admin happenings POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create happening" },
      { status: 500 }
    );
  }
}

