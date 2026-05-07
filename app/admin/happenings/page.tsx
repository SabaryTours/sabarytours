"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Link from "next/link";
import {
  Edit02Icon,
  Delete01Icon,
  PlusSignIcon,
  PlayCircle02Icon,
} from "hugeicons-react";

interface Happening {
  id: string;
  name: string;
  status: string;
  image_url: string;
  link_url?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export default function AdminHappeningsPage() {
  const [happenings, setHappenings] = useState<Happening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHappenings();
  }, []);

  const fetchHappenings = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("now_happenings")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHappenings(data as Happening[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    const res = await fetch(`/api/admin/happenings/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setHappenings((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const toggleActive = async (happening: Happening) => {
    const res = await fetch(`/api/admin/happenings/${happening.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !happening.is_active }),
    });
    if (res.ok) {
      setHappenings((prev) =>
        prev.map((h) =>
          h.id === happening.id ? { ...h, is_active: !h.is_active } : h
        )
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">
            What&apos;s Happening Now
          </h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            Manage the live cards on the home page section, including YouTube
            links for ongoing tours.
          </p>
        </div>
        <Link
          href="/admin/happenings/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans text-sm font-semibold shadow-sm"
        >
          <PlusSignIcon size={18} />
          Add Card
        </Link>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
            Loading cards...
          </div>
        ) : happenings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
            No cards yet. Click &quot;Add Card&quot; to create one.
          </div>
        ) : (
          happenings.map((h) => (
            <div
              key={h.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-gray-800 line-clamp-2">
                    {h.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status:{" "}
                    <span className="font-semibold uppercase">
                      {h.status}
                    </span>
                  </p>
                  {h.link_url && (
                    <a
                      href={h.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-[#ff5e00] hover:underline"
                    >
                      <PlayCircle02Icon size={14} />
                      View on YouTube
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(h)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    h.is_active
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {h.is_active ? "Active" : "Hidden"}
                </button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Link
                  href={`/admin/happenings/${h.id}`}
                  className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg"
                  title="Edit"
                >
                  <Edit02Icon size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(h.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Delete01Icon size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  YouTube Link
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Active
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 font-sans"
                  >
                    Loading cards...
                  </td>
                </tr>
              ) : happenings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 font-sans"
                  >
                    No cards added yet.
                  </td>
                </tr>
              ) : (
                happenings.map((h) => (
                  <tr
                    key={h.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800 font-sans line-clamp-1">
                        {h.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 font-sans uppercase">
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {h.link_url ? (
                        <a
                          href={h.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#ff5e00] hover:underline"
                        >
                          <PlayCircle02Icon size={14} />
                          YouTube
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-sans">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(h)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          h.is_active
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {h.is_active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/happenings/${h.id}`}
                          className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg"
                          title="Edit"
                        >
                          <Edit02Icon size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Delete01Icon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

