export type TripOutlineCardMeta = {
  description?: string;
  image_url?: string;
  book_url?: string;
  tour_slug?: string;
  card_type?: "featured" | "upcoming";
  date?: string;
  inclusions?: string;
  price?: string;
  seats_remaining?: number | null;
  total_seats?: number | null;
  show_seats?: boolean;
  details?: string;
};

export function parseTripOutlineBody(raw: string | null | undefined): TripOutlineCardMeta {
  const fallback = (raw || "").trim();
  if (!fallback) return {};

  try {
    const parsed = JSON.parse(fallback) as TripOutlineCardMeta;
    if (parsed && typeof parsed === "object") {
      return {
        description: typeof parsed.description === "string" ? parsed.description : "",
        image_url: typeof parsed.image_url === "string" ? parsed.image_url : "",
        book_url: typeof parsed.book_url === "string" ? parsed.book_url : "",
        tour_slug: typeof parsed.tour_slug === "string" ? parsed.tour_slug : "",
        card_type: parsed.card_type === "featured" ? "featured" : "upcoming",
        date: typeof parsed.date === "string" ? parsed.date : "",
        inclusions: typeof parsed.inclusions === "string" ? parsed.inclusions : "",
        price: typeof parsed.price === "string" ? parsed.price : "",
        seats_remaining: typeof parsed.seats_remaining === "number" ? parsed.seats_remaining : null,
        total_seats: typeof parsed.total_seats === "number" ? parsed.total_seats : null,
        show_seats: parsed.show_seats === true,
        details: typeof parsed.details === "string" ? parsed.details : "",
      };
    }
  } catch {
    // Backward compatibility with legacy plain-text bodies.
  }

  return { description: fallback, image_url: "", book_url: "", card_type: "upcoming" };
}

export function buildTripOutlineBody(meta: TripOutlineCardMeta): string | null {
  const description = String(meta.description || "").trim();
  const image_url = String(meta.image_url || "").trim();
  const book_url = String(meta.book_url || "").trim();
  const tour_slug = String(meta.tour_slug || "").trim();
  const card_type = meta.card_type === "featured" ? "featured" : "upcoming";
  const date = String(meta.date || "").trim();
  const inclusions = String(meta.inclusions || "").trim();
  const price = String(meta.price || "").trim();
  const details = String(meta.details || "").trim();
  const seats_remaining = typeof meta.seats_remaining === "number" ? meta.seats_remaining : null;
  const total_seats = typeof meta.total_seats === "number" ? meta.total_seats : null;
  const show_seats = meta.show_seats === true;

  if (!description && !image_url && !book_url && !tour_slug && !date && !inclusions && !price && !details) return null;

  return JSON.stringify({
    description,
    image_url,
    book_url,
    tour_slug,
    card_type,
    date,
    inclusions,
    price,
    seats_remaining,
    total_seats,
    show_seats,
    details,
  });
}
