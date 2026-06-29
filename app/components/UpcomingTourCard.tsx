import Image from "next/image";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

export type UpcomingTourCardData = {
  key: string;
  title: string;
  description: string;
  image_url: string;
  book_url: string;
  card_type: "featured" | "upcoming";
  date: string;
  inclusions: string;
  price: string;
  seats_remaining: number | null;
  total_seats: number | null;
  show_seats: boolean;
  details: string;
  accent_color?: string;
};

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7f0] border border-orange-100 px-3 py-1.5 text-xs font-sans text-gray-700">
      <span className="font-bold text-[#ff5e00]">{label}</span>
      <span>{value}</span>
    </span>
  );
}

export default function UpcomingTourCard({
  card,
  monthLabel,
  moreInMonth = 0,
}: {
  card: UpcomingTourCardData;
  monthLabel?: string;
  moreInMonth?: number;
}) {
  const accent = card.accent_color || "#ff5e00";
  const excerpt = card.details || card.description || "Details coming soon for this experience.";
  const isFeatured = card.card_type === "featured";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {card.image_url ? (
          <Image
            src={card.image_url}
            alt={card.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 86vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-sm font-sans text-gray-400"
            style={{
              background: `linear-gradient(135deg, ${accent}22 0%, #fff7f0 100%)`,
            }}
          >
            Image coming soon
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {monthLabel ? (
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide font-sans text-white shadow-sm"
              style={{ backgroundColor: accent }}
            >
              {monthLabel}
            </span>
          ) : null}
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide font-sans text-white shadow-sm"
            style={{ backgroundColor: isFeatured ? accent : "rgba(255,255,255,0.92)", color: isFeatured ? "#fff" : "#222" }}
          >
            {isFeatured ? "Featured" : "Upcoming"}
          </span>
        </div>

        {card.price ? (
          <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold font-sans text-[#ff5e00] shadow-md">
            {card.price}
          </div>
        ) : null}

        <div className="absolute bottom-3 left-3 right-16">
          <h3
            className="text-lg sm:text-xl text-white uppercase leading-tight drop-shadow-md line-clamp-2"
            style={{ fontFamily: "var(--font-unlimited-pie)", textShadow: "0 2px 8px rgba(0,0,0,0.45)" }}
          >
            {card.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {card.date ? <MetaChip label="Date" value={card.date} /> : null}
          {card.show_seats && typeof card.total_seats === "number" ? (
            <MetaChip label="Seats" value={String(card.total_seats)} />
          ) : null}
          {card.show_seats && typeof card.seats_remaining === "number" ? (
            <MetaChip label="Left" value={String(card.seats_remaining)} />
          ) : null}
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600 font-sans line-clamp-4">
          {excerpt}
        </p>

        {card.inclusions ? (
          <p className="mt-3 text-xs leading-relaxed text-gray-500 font-sans line-clamp-2">
            <span className="font-bold text-[#0060cc]">Includes:</span> {card.inclusions}
          </p>
        ) : null}

        {moreInMonth > 0 ? (
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[#ff5e00] font-sans">
            +{moreInMonth} more this month
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2.5 pt-4 border-t border-gray-100">
          <Link
            href={card.book_url}
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold text-white font-sans transition-colors hover:opacity-95"
            style={{ backgroundColor: accent }}
          >
            Book now
          </Link>
          <ShareButtons
            title={card.title}
            path={card.book_url}
            text={`Check out this upcoming Sabary Tours experience: ${card.title}`}
            compact
          />
        </div>
      </div>
    </article>
  );
}
