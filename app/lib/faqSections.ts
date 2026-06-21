export type FaqSectionPreset = {
  title: string;
  slug: string;
  sortOrder: number;
};

export const FAQ_SECTION_PRESETS: FaqSectionPreset[] = [
  { title: "Booking & reservations", slug: "booking-reservations", sortOrder: 1 },
  { title: "First-time visitors & travel support", slug: "first-time-visitors", sortOrder: 2 },
  { title: "Tour experience", slug: "tour-experience", sortOrder: 3 },
  { title: "Suitability & accessibility", slug: "suitability-accessibility", sortOrder: 4 },
  { title: "Payments & flexibility", slug: "payments-flexibility", sortOrder: 5 },
  { title: "Cancellations & refunds", slug: "cancellations-refunds", sortOrder: 6 },
  { title: "Trust, safety & reputation", slug: "trust-safety", sortOrder: 7 },
  { title: "Media & content", slug: "media-content", sortOrder: 8 },
  { title: "Support & communication", slug: "support-contact", sortOrder: 9 },
];

export function slugifyFaqSection(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findFaqSectionPreset(title: string) {
  return FAQ_SECTION_PRESETS.find((preset) => preset.title === title);
}
