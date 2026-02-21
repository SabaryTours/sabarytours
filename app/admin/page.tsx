"use client";

import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ tours: 0, blogs: 0, reviews: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      
      const { count: tours } = await supabase.from('tours').select('*', { count: 'exact', head: true });
      const { count: blogs } = await supabase.from('posts').select('*', { count: 'exact', head: true });
      const { count: reviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: bookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
      
      setStats({
        tours: tours || 0,
        blogs: blogs || 0,
        reviews: reviews || 0,
        bookings: bookings || 0
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center font-sans text-gray-500">
      Loading dashboard metrics...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
          <h3 className="text-gray-500 text-sm font-medium font-sans">Total Tours</h3>
          <p className="text-4xl font-bold text-gray-800 mt-2 font-sans">{stats.tours}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
          <h3 className="text-gray-500 text-sm font-medium font-sans">Total Blogs</h3>
          <p className="text-4xl font-bold text-gray-800 mt-2 font-sans">{stats.blogs}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 relative overflow-hidden">
          <h3 className="text-gray-500 text-sm font-medium font-sans relative z-10">Pending Reviews</h3>
          <p className="text-4xl font-bold text-[#ff5e00] mt-2 font-sans relative z-10">{stats.reviews}</p>
          {stats.reviews > 0 && (
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#ff5e00] opacity-10 rounded-full blur-2xl" />
          )}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
          <h3 className="text-gray-500 text-sm font-medium font-sans">Total Bookings</h3>
          <p className="text-4xl font-bold text-[#2B7BD4] mt-2 font-sans">{stats.bookings}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8">
        <h2 
          className="text-xl md:text-2xl text-gray-800 mb-4 uppercase"
          style={{ fontFamily: "var(--font-unlimited-pie)"}}
        >
          Welcome to Sabary <span className="text-[#ff5e00]">Admin</span>
        </h2>
        <p className="text-gray-600 font-sans text-base max-w-2xl leading-relaxed">
          Use the left sidebar navigation to manage your tour packages, publish travel blogs, 
          and approve customer testimonials. The statistics above reflect live data from your Supabase database.
        </p>
      </div>
    </div>
  );
}
