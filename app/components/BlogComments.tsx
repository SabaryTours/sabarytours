"use client";

import { useEffect, useState } from "react";

type BlogComment = {
  id: string;
  name: string;
  content: string;
  created_at: string;
};

export default function BlogComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", content: "" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/blog/${slug}/comments`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load comments");
        if (!cancelled) setComments(data.comments || []);
      } catch {
        if (!cancelled) setError("We couldn't load comments right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      setMessage(data.message || "Thanks for your comment!");
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
      }
      setForm({ name: "", email: "", content: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-12">
      <h3 className="text-[24px] font-bold text-[#222] mb-2">Leave a comment</h3>
      <p className="text-[#8e8e8e] text-[14px] mb-6">Your email address will not be published.</p>

      {message ? (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="px-4 py-3 border border-[#e3e3e3] rounded-lg focus:outline-none focus:border-[#ff5e00] text-[14px] leading-[24px] text-[#222]"
            required
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="px-4 py-3 border border-[#e3e3e3] rounded-lg focus:outline-none focus:border-[#ff5e00] text-[14px] leading-[24px] text-[#222]"
            required
          />
        </div>
        <textarea
          placeholder="Type your comment..."
          rows={6}
          value={form.content}
          onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
          className="w-full px-4 py-3 border border-[#e3e3e3] rounded-lg focus:outline-none focus:border-[#ff5e00] text-[14px] leading-[24px] text-[#222]"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#ff5e00] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e55500] disabled:opacity-60 transition-colors"
        >
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-[24px] font-bold text-[#222] mb-6">
          Comments {comments.length > 0 ? `(${comments.length})` : ""}
        </h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">No approved comments yet.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="font-bold text-gray-900">{comment.name}</p>
                  <time className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
