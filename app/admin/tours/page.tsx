"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Edit02Icon, Delete01Icon, PlusSignIcon } from "hugeicons-react";

export default function AdminToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('tours')
      .select(`
        id, 
        title, 
        category, 
        status, 
        currency,
        tour_prices(amount),
        tour_images(image_url)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setTours(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour? This will also remove all its images and pricing.')) return;
    
    try {
      const res = await fetch(`/api/admin/tours?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete tour");
      }

      fetchTours();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`Failed to delete the tour: ${error.message}`);
    }
  };

  const filteredTours = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = [...tours];

    if (q) {
      data = data.filter((tour) => {
        const title = String(tour.title || "").toLowerCase();
        const category = String(tour.category || "").toLowerCase();
        return title.includes(q) || category.includes(q);
      });
    }

    if (statusFilter !== "all") {
      data = data.filter((tour) => tour.status === statusFilter);
    }

    if (sortBy === "oldest") {
      data.sort(
        (a, b) =>
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
    } else if (sortBy === "a-z") {
      data.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    } else {
      data.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    }

    return data;
  }, [tours, query, statusFilter, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage Tours</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">View, edit, or create new package tours.</p>
        </div>
        <Link 
          href="/admin/tours/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans text-sm font-semibold shadow-sm"
        >
          <PlusSignIcon size={18} />
          Create New Tour
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tour title or category..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5e00] focus:border-[#ff5e00] outline-none font-sans text-sm text-black"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-sm bg-white text-black"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-sm bg-white text-black"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="a-z">A to Z</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-sans mt-3">
          Showing {filteredTours.length} {filteredTours.length === 1 ? "tour" : "tours"}
        </p>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">Loading tours...</div>
        ) : filteredTours.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">No tours found.</div>
        ) : (
          filteredTours.map((tour) => {
            const primaryImage = tour.tour_images?.[0]?.image_url || "/assets/placeholder-tour.jpg";
            const price = tour.tour_prices?.[0]?.amount || 0;
            return (
              <div key={tour.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={primaryImage} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <p className="text-sm font-bold text-gray-800 font-sans line-clamp-2 flex-1 min-w-0">{tour.title}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 font-sans capitalize">{tour.category?.replace(/_/g, " ") || "Unknown"}</span>
                  <span className="text-sm font-semibold text-gray-800 font-sans">{tour.currency || "GHS"} {price}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border ${tour.status === "published" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                    {tour.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Link href={`/admin/tours/${tour.id}`} className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg" title="Edit"><Edit02Icon size={18} /></Link>
                  <button onClick={() => handleDelete(tour.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Delete01Icon size={18} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Tour</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">Loading tours...</td></tr>
              ) : filteredTours.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">No tours found.</td></tr>
              ) : filteredTours.map((tour) => {
                const primaryImage = tour.tour_images?.[0]?.image_url || "/assets/placeholder-tour.jpg";
                const price = tour.tour_prices?.[0]?.amount || 0;
                return (
                  <tr key={tour.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image src={primaryImage} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <p className="text-sm font-bold text-gray-800 font-sans">{tour.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600 font-sans capitalize">{tour.category?.replace(/_/g, " ") || "Unknown"}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-gray-800 font-sans">{tour.currency || "GHS"} {price}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border ${tour.status === "published" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                        {tour.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/tours/${tour.id}`} className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg" title="Edit"><Edit02Icon size={18} /></Link>
                        <button onClick={() => handleDelete(tour.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Delete01Icon size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
