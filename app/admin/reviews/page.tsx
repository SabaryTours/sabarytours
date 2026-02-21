"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Image from "next/image";
import { Tick02Icon, Cancel01Icon, Delete01Icon } from "hugeicons-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient();
    await supabase.from('reviews').update({ status: newStatus }).eq('id', id);
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to completely delete this review?')) return;
    const supabase = createClient();
    await supabase.from('reviews').delete().eq('id', id);
    fetchReviews();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage Reviews</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">Approve or reject customer testimonials for the Landing Page.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Review</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">No reviews found.</td>
                </tr>
              ) : reviews.map((review) => {
                const primaryImage = review.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop';
                
                return (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mt-1">
                          <Image src={primaryImage} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 font-sans">{review.name}</p>
                          <p className="text-xs text-gray-500 font-sans">{review.position || 'Guest'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-md">
                      <div className="text-sm text-gray-600 font-sans italic line-clamp-3">
                        "{review.message}"
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border ${
                        review.status === 'approved' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : review.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {review.status ? review.status.charAt(0).toUpperCase() + review.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {review.status !== 'approved' && (
                          <button 
                            onClick={() => handleUpdateStatus(review.id, 'approved')}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Tick02Icon size={18} />
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button 
                            onClick={() => handleUpdateStatus(review.id, 'rejected')}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <Cancel01Icon size={18} />
                          </button>
                        )}
                        <div className="w-px h-6 bg-gray-200 mx-1" />
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Delete01Icon size={18} />
                        </button>
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
