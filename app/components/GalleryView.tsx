"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Cancel01Icon } from "hugeicons-react";

export type GalleryImageRow = {
  id: string;
  image_url: string;
  caption?: string | null;
  sort_order?: number | null;
};

export default function GalleryView({ initialItems = [] as GalleryImageRow[] }: { initialItems?: GalleryImageRow[] }) {
  const [items, setItems] = useState<GalleryImageRow[]>(initialItems);
  const [lightbox, setLightbox] = useState<GalleryImageRow | null>(null);

  useEffect(() => {
    if (initialItems.length) return;
    void (async () => {
      try {
        const res = await fetch("/api/gallery");
        const j = await res.json();
        if (j.images?.length) setItems(j.images);
      } catch {
        /* ignore */
      }
    })();
  }, [initialItems.length]);

  const open = useCallback((row: GalleryImageRow) => setLightbox(row), []);
  const close = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close]);

  return (
    <>
      {items.length === 0 ? (
        <p className="text-center text-gray-500 font-sans py-16">Gallery photos will appear here soon.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => open(row)}
              className="relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5e00]"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image src={row.image_url} alt={row.caption || "Gallery"} fill className="object-cover" unoptimized />
              </div>
              {row.caption ? (
                <p className="p-3 text-left text-sm font-sans font-medium text-gray-800">{row.caption}</p>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <Cancel01Icon size={28} />
          </button>
          <div className="relative max-h-[90vh] max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video w-full min-h-[200px]">
              <Image
                src={lightbox.image_url}
                alt={lightbox.caption || "Gallery"}
                fill
                className="object-contain"
                unoptimized
                sizes="100vw"
              />
            </div>
            {lightbox.caption ? (
              <p className="mt-4 text-center text-white/90 font-sans text-sm">{lightbox.caption}</p>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
