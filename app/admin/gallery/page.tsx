"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Delete02Icon, ImageAdd01Icon } from "hugeicons-react";

type Row = { id: string; image_url: string; caption: string | null; sort_order: number };

export default function AdminGalleryPage() {
  const [images, setImages] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to load");
      setImages(j.images || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    const items: { image_url: string; caption: string | null; sort_order: number }[] = [];
    const files = Array.from(fileList);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.secure_url) {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }
        items.push({
          image_url: data.secure_url,
          caption: null,
          sort_order: images.length + i,
        });
      }
      if (!items.length) {
        toast.error("No image files selected.");
        return;
      }
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Save failed");
      toast.success(`Added ${j.inserted ?? items.length} photo(s).`);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this image from the gallery?")) return;
    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Delete failed");
      toast.success("Removed.");
      setImages((prev) => prev.filter((r) => r.id !== id));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Gallery</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">
          Bulk-upload images (stored on Cloudinary, listed here). They appear on the public{" "}
          <a href="/gallery" className="text-[#0060cc] font-semibold hover:underline">
            /gallery
          </a>{" "}
          page.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center">
        <label className="inline-flex cursor-pointer flex-col items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ff5e00] px-6 py-3 text-white font-bold font-sans shadow-sm hover:bg-[#e55500]">
            <ImageAdd01Icon size={22} />
            {uploading ? "Uploading…" : "Choose images (multi-select)"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="text-xs text-gray-500 font-sans max-w-md">
            Select many files at once. Each file is uploaded then saved to the gallery in order.
          </span>
        </label>
      </div>

      {loading ? (
        <p className="text-gray-500 font-sans">Loading…</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500 font-sans">No gallery images yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm group">
              <div className="relative aspect-[4/3]">
                <Image src={img.image_url} alt="" fill className="object-cover" unoptimized />
              </div>
              <div className="p-3 flex justify-end border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => void remove(img.id)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  <Delete02Icon size={18} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
