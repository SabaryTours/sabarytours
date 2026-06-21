"use client";

import CachedImage from "./CachedImage";
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
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (initialItems.length > 0) return;
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
        <p className="text-center text-white/90 font-sans py-16">Gallery photos will appear here soon.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => open(row)}
              className="relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/30 bg-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <div className="relative aspect-[4/3] w-full">
                <CachedImage
                  src={row.image_url}
                  alt={row.caption || "Gallery"}
                  fill
                  maxWidth={800}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
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
              <CachedImage
                src={lightbox.image_url}
                alt={lightbox.caption || "Gallery"}
                fill
                maxWidth={1600}
                className="object-contain"
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
