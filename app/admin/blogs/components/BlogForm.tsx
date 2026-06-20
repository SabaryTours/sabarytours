"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import 'react-quill-new/dist/quill.snow.css';
import toast from "react-hot-toast";
import { BLOG_CATEGORIES } from "../../../lib/blogCategories";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SAVE_TIMEOUT_MS = 120_000;

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function readFetchErrorMessage(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (j?.error && typeof j.error === "string") return j.error;
  } catch {
    /* ignore */
  }
  return `Save failed (${res.status})`;
}

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false }
);

interface BlogFormProps {
  initialData?: any;
}

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    summary: initialData?.summary || "",
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : "",
    category: initialData?.category || "",
    is_featured: Boolean(initialData?.is_featured),
    image_url: initialData?.image_url || "",
    status: initialData?.status || "published",
  });

  /** Quill is uncontrolled so large HTML does not re-render the whole editor on every keystroke. */
  const editorKey = String(initialData?.id ?? "new");
  const initialHtml = initialData?.content ?? "";
  const contentDraftRef = useRef(initialHtml);
  const quillRef = useRef<{ getEditor: () => { clipboard: { dangerouslyPasteHTML: (html: string, source?: string) => void } } } | null>(null);
  const historyRef = useRef<string[]>([initialHtml]);
  const historyIndexRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    contentDraftRef.current = initialHtml;
    historyRef.current = [initialHtml];
    historyIndexRef.current = 0;
    setCanUndo(false);
  }, [editorKey, initialHtml]);

  const pushHistory = (html: string) => {
    const stack = historyRef.current.slice(0, historyIndexRef.current + 1);
    if (stack[stack.length - 1] === html) return;
    stack.push(html);
    if (stack.length > 50) stack.shift();
    historyRef.current = stack;
    historyIndexRef.current = stack.length - 1;
    setCanUndo(historyIndexRef.current > 0);
  };

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const html = historyRef.current[historyIndexRef.current];
    contentDraftRef.current = html;
    const editor = quillRef.current?.getEditor?.();
    if (editor) {
      editor.clipboard.dangerouslyPasteHTML(html, "silent");
    }
    setCanUndo(historyIndexRef.current > 0);
    toast.success("Undone");
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(`Image is too large (max ${MAX_IMAGE_BYTES / (1024 * 1024)}MB). Try a smaller file.`);
      input.value = "";
      return;
    }

    setUploadingImage(true);
    const uploadBody = new FormData();
    uploadBody.append("file", file);

    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), SAVE_TIMEOUT_MS);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadBody,
        signal: ac.signal,
      });
      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, image_url: data.secure_url }));
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Upload timed out. Check your connection or use a smaller image.");
      } else {
        toast.error("Failed to upload image.");
      }
    } finally {
      clearTimeout(timeoutId);
      setUploadingImage(false);
      input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || uploadingImage) return;

    setLoading(true);

    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), SAVE_TIMEOUT_MS);

    try {
      // Editing: keep existing slug so saves do not collide with unique(slug) or break URLs.
      const existingSlug =
        typeof initialData?.slug === "string" ? initialData.slug.trim() : "";
      const slug = initialData?.id
        ? existingSlug || generateSlug(formData.title)
        : generateSlug(formData.title);

      const postInput = {
        title: formData.title,
        slug,
        summary: formData.summary,
        tags: formData.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean),
        category: formData.category || null,
        is_featured: formData.is_featured,
        content: contentDraftRef.current,
        image_url: formData.image_url,
        status: formData.status,
      };

      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postInput,
          blogId: initialData?.id,
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const message = await readFetchErrorMessage(res);
        throw new Error(message);
      }

      toast.success("Article published!");
      router.push("/admin/blogs");
      router.refresh();
    } catch (error: unknown) {
      console.error("Error saving blog:", error);
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Save timed out. Your article may be very large or the network is slow—try again.");
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to save article.");
      } else {
        toast.error("Failed to save article.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Title</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black" />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Summary (Short Excerpt)</label>
          <textarea name="summary" rows={3} value={formData.summary} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black"
            placeholder="Culture, Food, Ghana, Travel Tips"
          />
          <p className="mt-1 text-xs text-gray-500 font-sans">Separate tags with commas.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Section</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans bg-white text-gray-900"
          >
            <option value="">Uncategorized</option>
            {BLOG_CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="mt-1"
            />
            <span className="font-sans">
              <span className="block text-sm font-bold text-[#222]">Feature as article of the week</span>
              <span className="block text-xs text-gray-600 mt-1">
                Shows at the top of the blog for 7 days and replaces any other featured article.
              </span>
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Cover Image</label>
          <div className="flex gap-2">
            <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black" placeholder="https://... or upload ->" />
            <label className={`px-4 py-2 bg-[#ff5e00] rounded-lg cursor-pointer transition-colors flex items-center justify-center font-sans text-sm font-semibold text-white ${uploadingImage ? 'opacity-50' : ''}`}>
              {uploadingImage ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </div>
          {formData.image_url && (
            <div className="mt-2 text-xs text-green-600 font-sans">✓ Image linked</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans bg-white text-gray-900">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700 font-sans">Article Content</label>
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="px-3 py-1.5 text-xs font-semibold font-sans border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Undo
          </button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden font-sans text-black placeholder:text-black">
          <ReactQuill
            key={editorKey}
            theme="snow"
            defaultValue={initialHtml}
            forwardedRef={quillRef}
            onChange={(html: string) => {
              contentDraftRef.current = html;
              pushHistory(html);
            }}
            className="h-64 mb-12 text-black placeholder:text-black"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-12">
        <button type="button" onClick={() => router.push('/admin/blogs')} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-sans font-semibold">Cancel</button>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="px-6 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans font-semibold disabled:opacity-50"
        >
          {uploadingImage ? "Wait for upload…" : loading ? "Saving…" : "Publish Article"}
        </button>
      </div>
    </form>
  );
}
