"use client";

import Link from "next/link";
import { Calendar03Icon, Clock01Icon, Location01Icon, UserGroupIcon } from "hugeicons-react";

import type { TourDeparture } from "../lib/scheduledTours";

function formatDate(iso: string): { weekday: string; day: string; month: string; full: string } {
  // Parse as a plain calendar date so the label never shifts by timezone.
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  if (Number.isNaN(date.getTime())) {
    return { weekday: "", day: iso, month: "", full: iso };
  }
  return {
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
    day: String(date.getDate()),
    month: date.toLocaleDateString("en-GB", { month: "short" }),
    full: date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

/** "9:00 am" from a 24h "09:00" value. */
function formatTime(value: string): string {
  const [h, min] = value.split(":").map(Number);
  if (!Number.isFinite(h)) return value;
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(min || 0).padStart(2, "0")} ${suffix}`;
}

function SeatsBadge({ departure }: { departure: TourDeparture }) {
  if (!departure.showSeats || typeof departure.seatsRemaining !== "number") return null;

  const left = departure.seatsRemaining;
  const soldOut = left <= 0;
  const scarce = !soldOut && left <= 5;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold font-sans ${
        soldOut
          ? "bg-gray-100 text-gray-500"
          : scarce
            ? "bg-red-50 text-red-600"
            : "bg-green-50 text-green-700"
      }`}
    >
      <UserGroupIcon size={13} />
      {soldOut ? "Fully booked" : `${left} seat${left === 1 ? "" : "s"} left`}
    </span>
  );
}

export default function TourDepartures({
  departures,
  tourTitle,
}: {
  departures: TourDeparture[];
  tourTitle: string;
}) {
  if (departures.length === 0) return null;

  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2
          className="text-xl font-bold font-sans text-gray-900 uppercase"
          style={{ fontFamily: "var(--font-unlimited-pie)" }}
        >
          Upcoming group departures
        </h2>
        <span className="rounded-full bg-[#fff7f0] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#ff5e00] font-sans">
          {departures.length} scheduled
        </span>
      </div>

      <p className="mb-5 text-sm text-gray-600 font-sans">
        {tourTitle} also runs as a group trip on set dates. Pick a departure below to join one —
        the date, time and pickup are fixed.
      </p>

      <ul className="flex flex-col gap-3">
        {departures.map((departure) => {
          const date = formatDate(departure.date);
          const soldOut = departure.showSeats && departure.seatsRemaining === 0;

          return (
            <li
              key={departure.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:flex-row sm:items-center"
            >
              <div
                className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-center shadow-sm ring-1 ring-gray-100"
                aria-hidden="true"
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#ff5e00] font-sans">
                  {date.month}
                </span>
                <span className="text-lg font-bold leading-none text-gray-900 font-sans">
                  {date.day}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-gray-900 font-sans">
                  <span className="sr-only">{date.full}</span>
                  <span aria-hidden="true">
                    {date.weekday}, {date.day} {date.month}
                  </span>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 font-sans">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock01Icon size={14} className="text-gray-400" />
                    {formatTime(departure.time)}
                  </span>
                  {departure.pickup ? (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Location01Icon size={14} className="shrink-0 text-gray-400" />
                      <span className="truncate">{departure.pickup}</span>
                    </span>
                  ) : null}
                  <SeatsBadge departure={departure} />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end lg:flex-row lg:items-center">
                {departure.price ? (
                  <span className="text-sm font-bold text-gray-900 font-sans">
                    {departure.price}
                  </span>
                ) : null}
                {soldOut ? (
                  <span className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-400 font-sans">
                    Sold out
                  </span>
                ) : (
                  <Link
                    href={departure.bookUrl}
                    className="inline-flex items-center justify-center rounded-full bg-[#ff5e00] px-5 py-2.5 text-sm font-bold text-white font-sans transition-colors hover:bg-[#e55500]"
                  >
                    Book this date
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Link
        href="/upcoming-tours"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0060cc] font-sans transition-colors hover:text-[#ff5e00]"
      >
        <Calendar03Icon size={16} />
        See the full departure calendar
      </Link>
    </section>
  );
}
