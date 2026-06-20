import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../utils/supabase/server";
import { getPublishedTourOptions } from "../../../lib/api";
import { tourBookingHref } from "../../../lib/tourUrls";

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
    .order("month", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tourOptions = await getPublishedTourOptions();
  return NextResponse.json({ year, rows: data || [], tourOptions });
}

type Row = {
  id?: string;
  month: number;
  title: string;
  body?: string | null;
  description?: string | null;
  image_url?: string | null;
  book_url?: string | null;
  card_type?: "featured" | "upcoming";
  accent_color?: string | null;
  is_published?: boolean;
  sort_order?: number;
};

function parseTourSlugFromBody(body: string | null | undefined): string {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body) as { tour_slug?: string };
    return typeof parsed.tour_slug === "string" ? parsed.tour_slug.trim() : "";
  } catch {
    return "";
  }
}

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
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "rows array required" }, { status: 400 });
    }

    const payload = rows
      .filter((r) => r.month >= 1 && r.month <= 12)
      .map((r, idx) => {
        const normalizedTitle = (r.title || "").trim() || `Month ${r.month}`;
        const linkedTourSlug = parseTourSlugFromBody(r.body);
        const bookUrl = r.book_url?.trim()
          || (linkedTourSlug ? tourBookingHref(linkedTourSlug) : `/contact?from=upcoming-tour`);

        return {
          id: r.id,
          year,
          month: r.month,
          title: normalizedTitle,
          body: r.body?.trim() || null,
          description: r.description?.trim() || null,
          image_url: r.image_url?.trim() || null,
          book_url: bookUrl,
          card_type: r.card_type === "featured" ? "featured" : "upcoming",
          accent_color: (r.accent_color || "#ff5e00").trim(),
          is_published: r.is_published !== false,
          sort_order: Number.isFinite(r.sort_order) ? Number(r.sort_order) : idx,
          updated_at: new Date().toISOString(),
        };
      });

    const { error: clearError } = await supabaseAdmin.from("trip_year_outline").delete().eq("year", year);
    if (clearError) throw clearError;

    const rowsToInsert = payload.map((row) => ({
      year: row.year,
      month: row.month,
      title: row.title,
      body: row.body,
      description: row.description,
      image_url: row.image_url,
      book_url: row.book_url,
      card_type: row.card_type,
      accent_color: row.accent_color,
      is_published: row.is_published,
      sort_order: row.sort_order,
      updated_at: row.updated_at,
    }));
    if (rowsToInsert.length > 0) {
      const { error } = await supabaseAdmin.from("trip_year_outline").insert(rowsToInsert);
      if (error) throw error;
    }
    return NextResponse.json({ success: true, saved: rowsToInsert.length });
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
