import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { rateLimit } from "../../../lib/rateLimit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function compactDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function nextCompactDate(value: string): string | null {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = (url.searchParams.get("reference") || "").trim();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { ok } = rateLimit({ key: `booking-calendar:${ip}`, limit: 30, windowMs: 60_000 });

  if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!/^[A-Za-z0-9_-]{6,200}$/.test(reference)) {
    return NextResponse.json({ error: "Invalid booking reference" }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("package_name, tour_date, time_slot")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const start = compactDate(booking.tour_date || "");
  const end = nextCompactDate(booking.tour_date || "");
  if (!start || !end) {
    return NextResponse.json({ error: "This booking does not have a valid tour date" }, { status: 400 });
  }

  const details = [
    booking.time_slot ? `Tour time: ${booking.time_slot}` : null,
    `Booking reference: ${reference}`,
    "Sabary Tours will send the final meeting and pickup details separately.",
  ].filter(Boolean).join("\n");

  const calendarUrl = new URL("https://calendar.google.com/calendar/render");
  calendarUrl.searchParams.set("action", "TEMPLATE");
  calendarUrl.searchParams.set("text", `${booking.package_name || "Tour"} — Sabary Tours`);
  calendarUrl.searchParams.set("dates", `${start}/${end}`);
  calendarUrl.searchParams.set("details", details);
  calendarUrl.searchParams.set("location", "Accra, Ghana");
  calendarUrl.searchParams.set("ctz", "Africa/Accra");

  return NextResponse.redirect(calendarUrl);
}