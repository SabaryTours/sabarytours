"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import toast from "react-hot-toast";
import {
  FAQ_SECTION_PRESETS,
  findFaqSectionPreset,
  slugifyFaqSection,
} from "../../../lib/faqSections";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false },
);

type FaqFormData = {
  section_title: string;
  section_slug: string;
  section_sort_order: number;
  question: string;
  answer: string;
  sort_order: number;
  status: "published" | "draft";
};

interface FaqFormProps {
  initialData?: Partial<FaqFormData> & { id?: string };
}

function buildInitialForm(initialData?: FaqFormProps["initialData"]): FaqFormData {
  const preset = initialData?.section_title
    ? findFaqSectionPreset(initialData.section_title)
    : undefined;

  return {
    section_title: initialData?.section_title || FAQ_SECTION_PRESETS[0]?.title || "",
    section_slug: initialData?.section_slug || preset?.slug || "",
    section_sort_order: initialData?.section_sort_order ?? preset?.sortOrder ?? 0,
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    sort_order: initialData?.sort_order ?? 1,
    status: initialData?.status === "draft" ? "draft" : "published",
  };
}

export default function FaqForm({ initialData }: FaqFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [useCustomSection, setUseCustomSection] = useState(() => {
    if (!initialData?.section_title) return false;
    return !findFaqSectionPreset(initialData.section_title);
  });
  const [formData, setFormData] = useState<FaqFormData>(() => buildInitialForm(initialData));

  const applySectionPreset = (title: string) => {
    const preset = findFaqSectionPreset(title);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        section_title: preset.title,
        section_slug: preset.slug,
        section_sort_order: preset.sortOrder,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      section_title: title,
      section_slug: slugifyFaqSection(title),
    }));
  };

  const handleSectionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const title = e.target.value;
    applySectionPreset(title);
  };

  const handleCustomSectionTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      section_title: title,
      section_slug: slugifyFaqSection(title),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "section_sort_order" || name === "sort_order" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faqInput: formData,
          faqId: initialData?.id,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to save FAQ");
      }

      toast.success("FAQ saved!");
      router.push("/admin/faqs");
      router.refresh();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Section</label>
          {!useCustomSection ? (
            <select
              value={formData.section_title}
              onChange={handleSectionSelect}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
            >
              {FAQ_SECTION_PRESETS.map((preset) => (
                <option key={preset.slug} value={preset.title}>
                  {preset.title}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required
              value={formData.section_title}
              onChange={handleCustomSectionTitle}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
              placeholder="Custom section title"
            />
          )}
          <button
            type="button"
            onClick={() => setUseCustomSection((prev) => !prev)}
            className="mt-2 text-sm text-[#0060cc] font-semibold hover:underline font-sans"
          >
            {useCustomSection ? "Use preset section" : "Use custom section"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Section slug (anchor ID)</label>
          <input
            type="text"
            name="section_slug"
            required
            value={formData.section_slug}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Section order</label>
          <input
            type="number"
            name="section_sort_order"
            min={0}
            required
            value={formData.section_sort_order}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Question</label>
          <input
            type="text"
            name="question"
            required
            value={formData.question}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Order within section</label>
          <input
            type="number"
            name="sort_order"
            min={0}
            required
            value={formData.sort_order}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Answer</label>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden font-sans">
          <ReactQuill
            theme="snow"
            value={formData.answer}
            onChange={(answer: string) => setFormData((prev) => ({ ...prev, answer }))}
            className="h-64 mb-12"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push("/admin/faqs")}
          className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-sans font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans font-semibold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save FAQ"}
        </button>
      </div>
    </form>
  );
}
