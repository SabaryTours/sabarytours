"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { StarIcon, UserIcon } from "hugeicons-react";

interface Comment {
  image_url: any;
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  content: string;
  created_at: string;
}

interface TourCommentsProps {
  tourSlug?: string;
}

export default function TourComments({ tourSlug }: TourCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [tourSlug]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const url = tourSlug ? `/api/reviews?tourSlug=${tourSlug}` : `/api/reviews`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data);
    } catch (err: any) {
      console.error(err);
      setError("We couldn't load the comments right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourSlug, name, rating, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to post comment");
      }

      // Don't optimistically add to list since it requires admin approval
      // setComments((prev) => [data, ...prev]);
      
      setSuccessMsg("Thanks for your review! It will appear here once approved by an admin.");
      
      // Reset form
      setName("");
      setContent("");
      setRating(5);
      
      // Clear success msg after 5s
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  };

  return (
    <div className="w-full mt-16 mb-20 bg-gray-50 rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
      
      {/* Decorative background element */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 bg-[#fbebf4] rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" 
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: The Form */}
        <div className="w-full lg:w-[40%]">
          <h3 
            className="text-[24px] md:text-[28px] text-gray-900 uppercase leading-none mb-6"
            style={{ fontFamily: 'var(--font-unlimited-pie)' }}
          >
            Leave a <span className="text-[#ff5e00]">Review</span>
          </h3>
          <p className="text-gray-600 font-sans text-[15px] mb-8">
            Had a great time? Let others know what to expect from this experience!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                How would you rate it?
              </label>
              <div className="flex gap-1" onMouseLeave={() => setHoveredStar(null)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <StarIcon
                      size={28}
                      className="transition-colors duration-200"
                      fill={(hoveredStar || rating) >= star ? "#ffb400" : "none"}
                      color={(hoveredStar || rating) >= star ? "#ffb400" : "#d1d5db"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-sans focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-colors"
              />
            </div>

            <div>
              <textarea
                placeholder="Share your thoughts about this tour..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-sans focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-sans mb-1">{error}</p>
            )}

            {successMsg && (
              <div className="bg-green-50 text-green-700 border border-green-200 text-sm font-sans p-3 rounded-lg mb-1">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1b0a00] text-white py-3.5 rounded-xl font-bold font-sans uppercase tracking-wide hover:bg-[#3f1a0b] transition-all disabled:opacity-70 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Post Review"
              )}
            </button>
          </form>
        </div>

        {/* Right Side: The Comments */}
        <div className="w-full lg:w-[60%] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-sans text-gray-900">
              Community Gallery <span className="text-gray-400 font-normal ml-2">({comments.length})</span>
            </h3>
          </div>

          <div className="flex-1 min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[#ff5e00]/20 border-t-[#ff5e00] rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/50 rounded-2xl border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <UserIcon size={24} className="text-gray-400" />
                </div>
                <h4 className="text-gray-900 font-bold mb-1">No reviews yet</h4>
                <p className="text-gray-500 text-sm">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment, index) => (
                  <div 
                    key={comment.id}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid flex flex-col h-fit animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                        {comment.image_url && comment.image_url.startsWith('data:image') ? (
                          // It's our generated SVG
                          <img src={comment?.image_url} alt={comment?.name} className="w-full h-full object-cover" />
                        ) : comment?.image_url ? (
                          <Image src={comment?.image_url} alt={comment?.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">
                            {comment?.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{comment.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                size={12}
                                fill={comment.rating >= star ? "#ffb400" : "none"}
                                color={comment.rating >= star ? "#ffb400" : "#d1d5db"}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Content */}
                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{comment.content}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
