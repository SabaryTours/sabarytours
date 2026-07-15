"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Image from "next/image";
import toast from "react-hot-toast";

export default function FeaturedToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("tours")
      .select(`
        id, 
        title, 
        category, 
        status,
        is_featured,
        tour_images(image_url)
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    
    if (data) setTours(data);
    setLoading(false);
  };

  const toggleFeatured = async (tourId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic UI update
    setTours(prev => prev.map(t => t.id === tourId ? { ...t, is_featured: newStatus } : t));
    
    try {
      const res = await fetch(`/api/admin/featured-tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tourId, is_featured: newStatus }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update featured status");
      }
      
      toast.success(newStatus ? "Tour featured successfully!" : "Tour removed from featured list.");
    } catch (error: any) {
      console.error("Toggle featured error:", error);
      toast.error(error.message);
      // Revert optimistic update
      setTours(prev => prev.map(t => t.id === tourId ? { ...t, is_featured: currentStatus } : t));
    }
  };

  const featuredCount = tours.filter(t => t.is_featured).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Featured Tours</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">
          Select up to 4 tours to feature on the homepage. Only published tours are shown here.
        </p>
        <div className="mt-4 inline-block bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 font-sans">
          <strong>{featuredCount}</strong> / 4 featured tours selected
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans w-16">Featured</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Tour</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-sans">Loading tours...</td></tr>
              ) : tours.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-sans">No published tours found.</td></tr>
              ) : tours.map((tour) => {
                const primaryImage = tour.tour_images?.[0]?.image_url || "/assets/placeholder-tour.jpg";
                return (
                  <tr key={tour.id} className={`hover:bg-gray-50/50 transition-colors group ${tour.is_featured ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={tour.is_featured || false}
                          onChange={() => toggleFeatured(tour.id, tour.is_featured || false)}
                          className="w-5 h-5 accent-[#ff5e00] text-[#ff5e00] rounded focus:ring-[#ff5e00] cursor-pointer"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 relative rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <Image src={primaryImage} alt={tour.title} fill className="object-cover" unoptimized />
                        </div>
                        <p className="text-sm font-bold text-gray-800 font-sans">{tour.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-sans capitalize">
                        {tour.category?.replace(/_/g, " ") || "Unknown"}
                      </span>
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
