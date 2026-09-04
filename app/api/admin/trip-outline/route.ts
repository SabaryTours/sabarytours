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

  if (!['admin', 'owner'].includes(profile?.role || '')) {
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

function hasFixedSchedule(body: string | null | undefined): boolean {
  if (!body) return false;
  try {
    const parsed = JSON.parse(body) as { date?: string; time?: string };
    return Boolean(parsed.date?.trim() && parsed.time?.trim());
  } catch {
    return false;
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

    const rowSlugs = rows.map((row) => parseTourSlugFromBody(row.body));
    if (rowSlugs.some((slug) => !slug)) {
      return NextResponse.json({ error: "Every upcoming card must be linked to a published tour." }, { status: 400 });
    }
    if (rows.some((row) => !hasFixedSchedule(row.body))) {
      return NextResponse.json({ error: "Every upcoming group tour must have a fixed date and time." }, { status: 400 });
    }
    const linkedSlugs = [...new Set(rowSlugs)];

    const { data: publishedTours, error: publishedError } = await supabaseAdmin
      .from("tours")
      .select("slug, title")
      .eq("status", "published");
    if (publishedError) throw publishedError;

    const publishedSlugs = new Set(
      (publishedTours || []).map((tour) =>
        tour.slug || tour.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      ),
    );
    const invalidSlugs = linkedSlugs.filter((slug) => !publishedSlugs.has(slug));
    if (invalidSlugs.length > 0) {
      return NextResponse.json(
        { error: "One or more selected tours are no longer published. Refresh the page and choose again." },
        { status: 400 },
      );
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

    const rowsToSave = payload.map((row) => ({
      ...(row.id ? { id: row.id } : {}),
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

    // Save first, then remove deleted cards. A failed insert must never erase the
    // year's existing schedule.
    const existingRows = rowsToSave.filter((row) => "id" in row);
    const newRows = rowsToSave.filter((row) => !("id" in row));
    const savedIds: string[] = [];

    if (existingRows.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("trip_year_outline")
        .upsert(existingRows, { onConflict: "id" })
        .select("id");
      if (error) throw error;
      savedIds.push(...(data || []).map((row) => row.id));
    }

    if (newRows.length > 0) {
      const { data, error } = await supabaseAdmin.from("trip_year_outline").insert(newRows).select("id");
      if (error) {
        if (error.code === "23505") {
          throw new Error("The database still allows only one tour per month. Apply the latest trip outline migration, then save again.");
        }
        throw error;
      }
      savedIds.push(...(data || []).map((row) => row.id));
    }

    const { data: currentRows, error: currentError } = await supabaseAdmin
      .from("trip_year_outline")
      .select("id")
      .eq("year", year);
    if (currentError) throw currentError;

    const staleIds = (currentRows || []).map((row) => row.id).filter((id) => !savedIds.includes(id));
    if (staleIds.length > 0) {
      const { error } = await supabaseAdmin.from("trip_year_outline").delete().in("id", staleIds);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, saved: savedIds.length });
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
