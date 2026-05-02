import type { Metadata } from "next";
import Footer from "../components/Footer";
import GalleryView, { type GalleryImageRow } from "../components/GalleryView";
import { createClient } from "../utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery | Sabary Tours",
  description: "Moments and scenes from tours across Ghana with Sabary Travel and Tours.",
};

export default async function GalleryPage() {
  let initialItems: GalleryImageRow[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_images")
      .select("id, image_url, caption, sort_order")
      .order("sort_order", { ascending: true });
    initialItems = (data as GalleryImageRow[]) || [];
  } catch {
    initialItems = [];
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="w-full px-4 sm:px-6 md:px-12 pt-10 pb-6">
        <div className="container mx-auto max-w-6xl">
          <p className="text-[#0060cc] text-sm font-bold uppercase tracking-wider font-sans mb-2">Sabary Tours</p>
          <h1
            className="text-4xl sm:text-5xl text-[#222] uppercase mb-4"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            Gallery
          </h1>
          <p className="text-gray-600 font-sans max-w-2xl mb-10">
            A glimpse of the experiences we craft—culture, nature, and good energy across Ghana.
          </p>
          <GalleryView initialItems={initialItems} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
