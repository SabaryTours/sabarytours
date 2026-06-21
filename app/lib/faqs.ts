import { supabaseAdmin } from "./adminAuth";

export type FaqRow = {
  id: string;
  section_title: string;
  section_slug: string;
  section_sort_order: number;
  question: string;
  answer: string;
  sort_order: number;
  status: "published" | "draft";
  created_at: string;
  updated_at: string;
};

export type FaqSectionGroup = {
  title: string;
  slug: string;
  sortOrder: number;
  items: Pick<FaqRow, "id" | "question" | "answer" | "sort_order">[];
};

function groupFaqs(rows: FaqRow[]): FaqSectionGroup[] {
  const sections = new Map<string, FaqSectionGroup>();

  for (const row of rows) {
    const key = row.section_slug;
    if (!sections.has(key)) {
      sections.set(key, {
        title: row.section_title,
        slug: row.section_slug,
        sortOrder: row.section_sort_order,
        items: [],
      });
    }
    sections.get(key)!.items.push({
      id: row.id,
      question: row.question,
      answer: row.answer,
      sort_order: row.sort_order,
    });
  }

  return Array.from(sections.values())
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
    .map((section) => ({
      ...section,
      items: [...section.items].sort((a, b) => a.sort_order - b.sort_order),
    }));
}

export async function getPublishedFaqs(): Promise<FaqSectionGroup[]> {
  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("*")
    .eq("status", "published")
    .order("section_sort_order", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load FAQs:", error.message);
    return [];
  }

  return groupFaqs((data as FaqRow[]) ?? []);
}

export async function getAllFaqsForAdmin(): Promise<FaqRow[]> {
  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("*")
    .order("section_sort_order", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load admin FAQs:", error.message);
    return [];
  }

  return (data as FaqRow[]) ?? [];
}
