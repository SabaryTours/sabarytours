import type { Metadata } from "next";
import Footer from "../components/Footer";
import GalleryView, { type GalleryImageRow } from "../components/GalleryView";
import { createClient } from "../utils/supabase/server";
import { buildPageMetadata } from "../lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Gallery | Sabary Tours",
  description: "Moments and scenes from tours across Ghana with Sabary Travel and Tours.",
  path: "/gallery",
});

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
      <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#ff5e00" }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              mixBlendMode: "overlay",
            }}
            aria-hidden
          />

          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-14 md:py-16 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-white text-[16px] leading-[24px] mb-6 text-center font-sans max-w-3xl mx-auto">
                Snapshots of culture, landscapes, and unforgettable moments from journeys across Ghana — the same spirit
                we bring to every Sabary tour.
              </div>
              <div className="text-white text-[16px] leading-[20px] mb-8 text-center font-sans">
                Every photo is a reminder that travel should feel personal:
              </div>
              <h1
                className="text-[20px] sm:text-[22px] md:text-[24px] text-white font-normal leading-normal mb-10 sm:mb-12 uppercase text-center break-words px-4"
                style={{
                  fontFamily: "var(--font-unlimited-pie)",
                  textShadow: "0px 4px 0px #893300",
                  WebkitTextStroke: "1px #893300",
                }}
              >
                what if more people could experience this?!
              </h1>

              <GalleryView initialItems={initialItems} />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
