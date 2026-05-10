export type TripOutlineCardMeta = {
  description?: string;
  image_url?: string;
  book_url?: string;
  card_type?: "featured" | "upcoming";
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
        card_type: parsed.card_type === "featured" ? "featured" : "upcoming",
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
  const card_type = meta.card_type === "featured" ? "featured" : "upcoming";

  if (!description && !image_url && !book_url) return null;

  return JSON.stringify({ description, image_url, book_url, card_type });
}
