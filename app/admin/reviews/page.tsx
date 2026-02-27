"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { StarIcon, CheckmarkBadge01Icon, Cancel01Icon, Delete02Icon } from "hugeicons-react";
import { format } from "date-fns";
import AdminSkeleton from '../components/AdminSkeleton';

interface Review {
  id: string;
  name: string;
  message: string;
  image_url: string | null;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  source: string;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
     console.log('STATUS:', res.status);
     console.log('RESPONSE:', data);

      if (!res.ok) throw new Error(`Failed to mark as ${newStatus}`);
      
      // Update local state
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("Failed to delete");
      
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete review");
    }
  };

  if (loading) {
    return <div className="p-8"><AdminSkeleton variant="table" rows={6} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-sans text-gray-900">Manage Reviews</h1>
        <div className="text-sm text-gray-500 font-sans bg-white px-4 py-2 rounded-lg border border-gray-200">
          Total: <span className="font-bold text-gray-900">{reviews.length}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-sans mb-4">
          {error}
        </div>
      )}

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-4">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 font-sans">No reviews found.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-gray-900">{review.name}</div>
                  <div className="text-xs text-gray-500">{format(new Date(review.created_at), "MMM d, yyyy")}</div>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium uppercase ${review.status === "approved" ? "bg-green-100 text-green-800" : review.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{review.status}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} size={16} fill={review.rating >= star ? "#ffb400" : "none"} color={review.rating >= star ? "#ffb400" : "#d1d5db"} />
                ))}
              </div>
              <p className="text-gray-700 text-sm line-clamp-3" title={review.message}>"{review.message}"</p>
              {review.source === "tour_comment" && (
                <span className="inline-block w-fit text-[10px] uppercase font-bold tracking-wider text-[#ff5e00] bg-orange-50 px-2 py-0.5 rounded">Tour Page</span>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                {review.status !== "approved" && (
                  <button onClick={() => updateStatus(review.id, "approved")} title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><CheckmarkBadge01Icon size={18} /></button>
                )}
                {review.status !== "rejected" && (
                  <button onClick={() => updateStatus(review.id, "rejected")} title="Reject" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Cancel01Icon size={18} /></button>
                )}
                <button onClick={() => deleteReview(review.id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded ml-auto"><Delete02Icon size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-sans">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-xs">
                <tr>
                  <th className="py-4 px-6 font-medium">Author</th>
                  <th className="py-4 px-6 font-medium">Rating</th>
                  <th className="py-4 px-6 font-medium w-1/3">Message</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{review.name}</div>
                      <div className="text-xs text-gray-500">{format(new Date(review.created_at), "MMM d, yyyy")}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon key={star} size={16} fill={review.rating >= star ? "#ffb400" : "none"} color={review.rating >= star ? "#ffb400" : "#d1d5db"} />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-700 line-clamp-2 md:line-clamp-3" title={review.message}>"{review.message}"</p>
                      {review.source === "tour_comment" && (
                        <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider text-[#ff5e00] bg-orange-50 px-2 py-0.5 rounded">Tour Page</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase ${review.status === "approved" ? "bg-green-100 text-green-800" : review.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{review.status}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {review.status !== "approved" && (
                          <button onClick={() => updateStatus(review.id, "approved")} title="Approve Review" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><CheckmarkBadge01Icon size={18} /></button>
                        )}
                        {review.status !== "rejected" && (
                          <button onClick={() => updateStatus(review.id, "rejected")} title="Reject Review" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Cancel01Icon size={18} /></button>
                        )}
                        <button onClick={() => deleteReview(review.id)} title="Delete Permanently" className="p-1.5 text-red-600 hover:bg-red-50 rounded ml-2"><Delete02Icon size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
