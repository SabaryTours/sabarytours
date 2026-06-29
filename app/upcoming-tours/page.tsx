import Link from "next/link";
import Footer from "../components/Footer";
import UpcomingTourCard, { type UpcomingTourCardData } from "../components/UpcomingTourCard";
import { getTripOutlineForYear } from "../lib/api";
import { parseTripOutlineBody } from "../lib/tripOutline";
import { resolveTripOutlineBookUrl } from "../lib/tourUrls";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UpcomingToursPage() {
  const year = new Date().getFullYear();
  const rows = await getTripOutlineForYear(year);
  const byMonth = new Map<number, typeof rows>();

  rows.forEach((r) => {
    const existing = byMonth.get(r.month) || [];
    existing.push(r);
    byMonth.set(r.month, existing);
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthRows = byMonth.get(month) || [];
    const cards: UpcomingTourCardData[] = monthRows.map((row, index) => {
      const meta = parseTripOutlineBody(row.body || "");
      const bookUrl = resolveTripOutlineBookUrl({
        tour_slug: meta.tour_slug,
        book_url: row.book_url || meta.book_url,
      });

      return {
        key: row.id || `${month}-${index}`,
        title: row.title?.trim() || `${MONTH_LABELS[i]} Featured Tour`,
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
    });

    return {
      month,
      label: MONTH_LABELS[i],
      shortLabel: MONTH_SHORT[i],
      cards,
    };
  }).filter((m) => m.cards.length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#2B7BD4] shadow-lg">
          <div
            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
            }}
          />

          <div className="relative z-10 mx-auto max-w-4xl px-4 py-14 sm:px-8 sm:py-16 md:px-12 md:py-20">
            <div className="rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8 md:p-10 md:text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0060cc] font-sans">
                Plan your year in Ghana
              </p>
              <h1
                className="text-[26px] sm:text-[32px] md:text-[40px] lg:text-[44px] leading-tight uppercase"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                <span className="text-[#222]">Upcoming </span>
                <span className="text-[#ff5e00]" style={{ textShadow: "2px 2px 0px #331300" }}>
                  tours {year}
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-[14px] sm:text-[15px] md:text-[16px] font-bold leading-relaxed text-[#222] font-sans mx-auto md:mx-0">
                Browse what&apos;s coming month by month — featured trips, dates, and quick booking for every season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="relative w-full px-4 sm:px-6 md:px-12 pb-12 md:pb-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'url("/assets/pattern.png")',
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
          }}
        />

        <div className="container relative z-10 mx-auto max-w-6xl">
          {months.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-[#fff7f0] to-white p-8 sm:p-12 text-center shadow-sm">
              <h2
                className="mb-3 text-2xl sm:text-3xl text-[#222] uppercase"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                Calendar coming soon
              </h2>
              <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-gray-600 font-sans">
                We&apos;re lining up experiences for {year}. Ask about a private trip or a region you don&apos;t see
                listed yet — we love building custom runs.
              </p>
              <Link
                href="/contact?from=upcoming-tours"
                className="inline-flex rounded-full bg-[#ff5e00] px-6 py-3 text-sm font-bold text-white hover:bg-[#e55500] font-sans transition-colors"
              >
                Contact us
              </Link>
            </div>
          ) : (
            <div className="space-y-14 md:space-y-16">
              {months.map((m) => {
                const accent = m.cards[0]?.accent_color || "#ff5e00";

                return (
                  <section key={m.month} aria-labelledby={`month-${m.month}`}>
                    <div className="mb-6 flex items-center gap-4 sm:mb-8">
                      <div
                        className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-md sm:h-16 sm:w-16"
                        style={{ backgroundColor: accent }}
                      >
                        <span
                          className="text-lg sm:text-xl leading-none uppercase"
                          style={{ fontFamily: "var(--font-unlimited-pie)" }}
                        >
                          {m.shortLabel}
                        </span>
                        <span className="mt-0.5 text-[10px] font-bold font-sans opacity-90">{year}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2
                          id={`month-${m.month}`}
                          className="text-xl sm:text-2xl md:text-3xl text-[#222] uppercase leading-tight"
                          style={{ fontFamily: "var(--font-unlimited-pie)" }}
                        >
                          {m.label}
                        </h2>
                        <p className="mt-1 text-sm font-sans text-gray-500">
                          {m.cards.length} experience{m.cards.length === 1 ? "" : "s"} this month
                        </p>
                      </div>

                      <div
                        className="hidden h-px flex-1 sm:block"
                        style={{
                          background: `linear-gradient(90deg, ${accent}55 0%, transparent 100%)`,
                        }}
                      />
                    </div>

                    <div className="-mx-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-pl-4 px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3">
                      {m.cards.map((card) => (
                        <div
                          key={card.key}
                          className="w-[86vw] max-w-[380px] shrink-0 snap-center sm:w-auto sm:max-w-none"
                        >
                          <UpcomingTourCard card={card} />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
