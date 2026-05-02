import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../utils/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AdminGate = { ok: true } | { ok: false; response: NextResponse };

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
  return { ok: true };
}

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const url = new URL(request.url);
  const y = parseInt(url.searchParams.get("year") || "", 10);
  const year = Number.isFinite(y) && y >= 2000 && y <= 2100 ? y : new Date().getFullYear();

  const { data, error } = await supabaseAdmin
    .from("trip_year_outline")
    .select("*")
    .eq("year", year)
    .order("month", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ year, rows: data || [] });
}

type Row = {
  year: number;
  month: number;
  title: string;
  body?: string | null;
  accent_color?: string | null;
  is_published?: boolean;
};

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const rows = body.rows as Row[] | undefined;
    const year = typeof body.year === "number" ? body.year : parseInt(String(body.year), 10);
    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Valid year required" }, { status: 400 });
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "rows array required" }, { status: 400 });
    }

    const payload = rows
      .filter((r) => r.month >= 1 && r.month <= 12)
      .map((r) => ({
        year,
        month: r.month,
        title: (r.title || "").trim() || `Month ${r.month}`,
        body: r.body?.trim() || null,
        accent_color: (r.accent_color || "#ff5e00").trim(),
        is_published: r.is_published !== false,
        updated_at: new Date().toISOString(),
      }));

    const { error } = await supabaseAdmin.from("trip_year_outline").upsert(payload, {
      onConflict: "year,month",
    });
    if (error) throw error;
    return NextResponse.json({ success: true, saved: payload.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabaseAdmin.from("trip_year_outline").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
