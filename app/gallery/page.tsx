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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef7ff_0%,#f7fafc_35%,#ffffff_70%)]">
      <section className="w-full px-4 sm:px-6 md:px-12 pt-8 sm:pt-10 pb-10">
        <div className="container mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#d7e9ff] bg-white/90 shadow-[0_20px_70px_rgba(0,96,204,0.12)]">
            <div className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-[#9cd0ff]/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-[#ffd8bf]/60 blur-3xl" />

            <div className="relative px-6 sm:px-10 pt-10 pb-8 sm:pb-10">
              <p className="text-[#0060cc] text-xs sm:text-sm font-bold uppercase tracking-[0.2em] font-sans mb-3">Sabary Tours</p>
              <h1
                className="text-4xl sm:text-5xl text-[#162033] uppercase mb-4"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                Gallery
              </h1>
              <p className="text-[#4b5563] font-sans max-w-2xl mb-8 leading-relaxed">
                Snapshots of culture, landscapes, and unforgettable moments from journeys across Ghana.
              </p>
              <GalleryView initialItems={initialItems} />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
