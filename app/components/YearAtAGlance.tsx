import Link from "next/link";
import type { TripOutlineMonth } from "../lib/api";
import { parseTripOutlineBody } from "../lib/tripOutline";
import { resolveTripOutlineBookUrl } from "../lib/tourUrls";
import UpcomingTourCard, { type UpcomingTourCardData } from "./UpcomingTourCard";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function hasContent(m: TripOutlineMonth) {
  const meta = parseTripOutlineBody(m.body);
  const description = m.description || meta.description || "";
  return Boolean((m.title && m.title.trim()) || description.trim());
}

function mapRowToCard(row: TripOutlineMonth, month: number, index: number): UpcomingTourCardData {
  const meta = parseTripOutlineBody(row.body || "");
  const bookUrl = resolveTripOutlineBookUrl({
    title: row.title,
    tour_slug: meta.tour_slug,
    book_url: row.book_url || meta.book_url,
    date: meta.date,
    time: meta.time,
    pickup: meta.pickup,
  });

  return {
    key: row.id || `${month}-${index}`,
    title: row.title?.trim() || `${MONTH_SHORT[month - 1]} tour`,
    description: row.description || meta.description || "",
    image_url: row.image_url || meta.image_url || "",
    book_url: bookUrl,
    card_type: row.card_type || meta.card_type || "upcoming",
    date: meta.date || "",
    inclusions: meta.inclusions || "",
    price: meta.price || "",
    seats_remaining: meta.seats_remaining ?? null,
    total_seats: meta.total_seats ?? null,
    show_seats: meta.show_seats === true,
    details: meta.details || "",
    accent_color: row.accent_color || "#ff5e00",
  };
}

export default function YearAtAGlance({ year, items }: { year: number; items: TripOutlineMonth[] }) {
  const byMonth = new Map<number, TripOutlineMonth[]>();
  items.forEach((r) => {
    const existing = byMonth.get(r.month) || [];
    existing.push(r);
    byMonth.set(r.month, existing);
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const rows = byMonth.get(month) || [];
    return { month, label: MONTH_SHORT[i], rows };
  })
    .map((m) => ({
      ...m,
      visibleRows: m.rows.filter((row) => hasContent(row)),
    }))
    .filter((m) => m.visibleRows.length > 0);

  const any = months.length > 0;

  if (!any) {
    return (
      <section id="year-at-a-glance" className="w-full px-4 sm:px-6 md:px-12 py-10 scroll-mt-24">
        <div className="container mx-auto max-w-6xl rounded-3xl border border-orange-100 bg-linear-to-br from-[#fff7f0] to-white p-8 sm:p-10 text-center shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#0060cc] font-sans">
            Plan your year
          </p>
          <h2
            className="text-2xl sm:text-3xl text-[#222] uppercase mb-2"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            {year} at a glance
          </h2>
          <p className="text-gray-600 font-sans text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            Our seasonal calendar is filling in. Ask about a private trip or a region you don&apos;t see listed yet — we
            love building custom runs.
          </p>
          <Link
            href="/contact?from=year-plan"
            data-analytics-cta="get_quote"
            data-analytics-location="year_at_a_glance"
            className="inline-flex rounded-full bg-[#ff5e00] px-6 py-3 text-sm font-bold text-white hover:bg-[#e55500] font-sans transition-colors"
          >
            Contact us
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="year-at-a-glance" className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 scroll-mt-24">
      <div
        className="relative overflow-hidden rounded-2xl py-10 sm:py-12 md:py-14"
        style={{ backgroundColor: "#FEEFFF" }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-80 mix-blend-overlay"
          style={{
            backgroundImage: "url(/assets/pattern.svg)",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
          }}
        />

        <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
          <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="text-center md:text-left">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#0060cc] font-sans">
                The rhythm of the year
              </p>
              <h2
                className="text-[24px] sm:text-[28px] md:text-[32px] text-[#222] uppercase leading-tight"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                Upcoming tours
              </h2>
              <p className="mt-2 max-w-xl text-sm text-gray-600 font-sans mx-auto md:mx-0">
                A quick look at what&apos;s scheduled. Tap a month to book and add to your calendar.
              </p>
            </div>
            <Link
              href="/upcoming-tours"
              className="inline-flex shrink-0 items-center justify-center self-center rounded-full border-2 border-[#ff5e00] px-5 py-2.5 text-sm font-bold text-[#ff5e00] transition-colors hover:bg-[#ff5e00] hover:text-white font-sans md:self-auto"
            >
              View all months
            </Link>
          </div>

          <div className="-mx-1 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-pl-1 px-1 pb-2 [-webkit-overflow-scrolling:touch] overscroll-x-contain">
            {months.map(({ month, label, visibleRows }) => {
              const topCard = mapRowToCard(visibleRows[0], month, 0);

              return (
                <div
                  key={month}
                  className="w-[86vw] max-w-[340px] shrink-0 snap-center sm:w-[320px] sm:max-w-none"
                >
                  <UpcomingTourCard
                    card={topCard}
                    monthLabel={`${label} ${year}`}
                    moreInMonth={visibleRows.length - 1}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
