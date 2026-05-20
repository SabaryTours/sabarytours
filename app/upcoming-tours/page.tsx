import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import { getTripOutlineForYear } from "../lib/api";
import { parseTripOutlineBody } from "../lib/tripOutline";

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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UpcomingToursPage() {
  const year = new Date().getFullYear();
  const rows = await getTripOutlineForYear(year);
  const byMonth = new Map<number, (typeof rows)>();
  rows.forEach((r) => {
    const existing = byMonth.get(r.month) || [];
    existing.push(r);
    byMonth.set(r.month, existing);
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthRows = byMonth.get(month) || [];
    const cards = monthRows.map((row, index) => {
      const meta = parseTripOutlineBody(row.body || "");
      return {
        key: row.id || `${month}-${index}`,
        title: row.title?.trim() || `${MONTH_LABELS[i]} Featured Tour`,
        description: row.description || meta.description || "",
        image_url: row.image_url || meta.image_url || "",
        book_url: row.book_url || meta.book_url || "/booking",
        card_type: row.card_type || meta.card_type || "upcoming",
      };
    });
    return {
      month,
      label: MONTH_LABELS[i],
      cards,
    };
  }).filter((m) => m.cards.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <section className="w-full px-4 sm:px-6 md:px-12 py-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 mb-8">
            <p className="text-[#0060cc] text-xs font-bold uppercase tracking-widest font-sans">
              Plan by month
            </p>
            <h1 className="text-3xl sm:text-4xl text-[#222] uppercase" style={{ fontFamily: "var(--font-unlimited-pie)" }}>
              Upcoming tours {year}
            </h1>
            <p className="text-gray-600 font-sans text-sm max-w-2xl">
              A month-by-month view of what to expect this year. Each card is managed in the admin CMS.
            </p>
          </div>

          <div className="space-y-10">
            {months.map((m) => (
              <section key={m.month} className="space-y-4">
                <h2 className="text-2xl text-gray-900 uppercase" style={{ fontFamily: "var(--font-unlimited-pie)" }}>
                  {m.label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {m.cards.map((card) => (
                    <article key={card.key} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                      <div className="relative aspect-[16/10] bg-gray-100">
                        {card.image_url ? (
                          <Image src={card.image_url} alt={card.title} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-sans">
                            No image yet
                          </div>
                        )}
                        <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#ff5e00] font-sans">
                          {card.card_type === "featured" ? "Featured" : "Upcoming"}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 font-sans leading-snug">{card.title}</h3>
                        <p className="mt-2 text-sm text-gray-600 font-sans leading-relaxed flex-1">
                          {card.description || "Details coming soon for this month."}
                        </p>
                        <Link
                          href={card.book_url}
                          className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#ff5e00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e55500] font-sans"
                        >
                          Book tour
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
