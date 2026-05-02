import Link from "next/link";
import type { TripOutlineMonth } from "../lib/api";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function hasContent(m: TripOutlineMonth) {
  return Boolean((m.title && m.title.trim()) || (m.body && m.body.trim()));
}

export default function YearAtAGlance({ year, items }: { year: number; items: TripOutlineMonth[] }) {
  const byMonth = new Map<number, TripOutlineMonth>();
  items.forEach((r) => byMonth.set(r.month, r));

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const row = byMonth.get(month);
    return { month, label: MONTH_SHORT[i], row };
  });

  const any = months.some(({ row }) => row && hasContent(row));

  if (!any) {
    return (
      <section id="year-at-a-glance" className="w-full px-4 sm:px-6 md:px-12 py-10 scroll-mt-24">
        <div className="container mx-auto max-w-6xl rounded-3xl border border-orange-100 bg-gradient-to-br from-[#fff7f0] to-white p-8 sm:p-10 text-center">
          <h2
            className="text-2xl sm:text-3xl text-[#222] uppercase mb-2"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            {year} at a glance
          </h2>
          <p className="text-gray-600 font-sans text-sm max-w-lg mx-auto mb-6">
            Our seasonal calendar is filling in. Ask about a private trip or a region you don&apos;t see listed yet—we
            love building custom runs.
          </p>
          <Link
            href="/contact?from=year-plan"
            className="inline-flex rounded-full bg-[#ff5e00] px-6 py-3 text-sm font-bold text-white hover:bg-[#e55500] font-sans"
          >
            Contact us
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="year-at-a-glance" className="w-full px-4 sm:px-6 md:px-12 py-10 scroll-mt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[#0060cc] text-xs font-bold uppercase tracking-widest font-sans mb-2">The rhythm of the year</p>
            <h2
              className="text-3xl sm:text-4xl text-[#222] uppercase"
              style={{ fontFamily: "var(--font-unlimited-pie)" }}
            >
              {year} at a glance
            </h2>
            <p className="mt-2 text-gray-600 font-sans text-sm max-w-xl">
              A playful calendar of what we&apos;re dreaming up—ask us about private runs or trips still on the drawing board.
            </p>
          </div>
          <Link
            href="/contact?from=year-plan"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#ff5e00] px-5 py-2.5 text-sm font-bold text-[#ff5e00] hover:bg-[#ff5e00] hover:text-white transition-colors font-sans shrink-0"
          >
            Plan with us
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-pl-1 [-webkit-overflow-scrolling:touch] overscroll-x-contain scrollbar-hide">
          {months.map(({ month, label, row }) => {
            if (!row || !hasContent(row)) {
              return (
                <div
                  key={month}
                  className="min-w-[140px] max-w-[160px] shrink-0 snap-start rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-4 flex flex-col items-center justify-center text-center opacity-70"
                >
                  <span className="text-xs font-bold text-gray-400 font-sans">{label}</span>
                  <span className="text-[11px] text-gray-400 mt-2 font-sans">TBA</span>
                </div>
              );
            }
            const accent = row.accent_color || "#ff5e00";
            return (
              <article
                key={month}
                className="min-w-[220px] max-w-[260px] shrink-0 snap-start rounded-2xl bg-white border border-gray-100 shadow-md overflow-hidden flex flex-col rotate-0 hover:-translate-y-1 transition-transform"
                style={{ borderTopWidth: "4px", borderTopColor: accent }}
              >
                <div className="px-4 pt-3 pb-1 flex items-baseline justify-between gap-2">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 font-sans">{label}</span>
                  <span className="text-[10px] font-bold uppercase text-gray-400 font-sans">{year}</span>
                </div>
                <div className="px-4 pb-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 font-sans text-lg leading-snug" style={{ color: "#111" }}>
                    {row.title}
                  </h3>
                  {row.body ? (
                    <p className="mt-2 text-sm text-gray-600 font-sans leading-relaxed line-clamp-5">{row.body}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
