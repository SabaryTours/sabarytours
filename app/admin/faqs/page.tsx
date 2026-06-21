"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit02Icon, Delete01Icon, PlusSignIcon } from "hugeicons-react";
import toast from "react-hot-toast";
import type { FaqRow } from "../../lib/faqs";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);

  const grouped = useMemo(() => {
    const map = new Map<string, { title: string; slug: string; items: FaqRow[] }>();
    for (const faq of faqs) {
      if (!map.has(faq.section_slug)) {
        map.set(faq.section_slug, {
          title: faq.section_title,
          slug: faq.section_slug,
          items: [],
        });
      }
      map.get(faq.section_slug)!.items.push(faq);
    }
    return Array.from(map.values());
  }, [faqs]);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFaqs([]);
        return;
      }
      setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
    } catch {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFaqs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;

    try {
      const res = await fetch(`/api/admin/faqs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data?.error === "string" ? data.error : "Could not delete FAQ.");
        return;
      }
      toast.success("FAQ deleted.");
      await fetchFaqs();
    } catch {
      toast.error("Could not delete FAQ.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage FAQs</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            Edit questions and answers shown on the public FAQ page.
          </p>
        </div>
        <Link
          href="/admin/faqs/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans text-sm font-semibold shadow-sm"
        >
          <PlusSignIcon size={18} />
          Add FAQ
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
          Loading FAQs...
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
          No FAQs yet. Add your first question or run the database migration to seed defaults.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((section) => (
            <div key={section.slug} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                <h2 className="text-sm font-bold text-gray-800 font-sans">{section.title}</h2>
                <p className="text-xs text-gray-500 font-sans mt-0.5">#{section.slug}</p>
              </div>
              <div className="divide-y divide-gray-100">
                {section.items.map((faq) => (
                  <div key={faq.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 font-sans">{faq.question}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-sans">
                        <span className="text-gray-500">Order {faq.sort_order}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold ${
                            faq.status === "published"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {faq.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/admin/faqs/${faq.id}`}
                        className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg"
                        title="Edit"
                      >
                        <Edit02Icon size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Delete01Icon size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
