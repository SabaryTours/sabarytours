"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckmarkBadge01Icon, Cancel01Icon, Delete02Icon } from "hugeicons-react";
import toast from "react-hot-toast";
import AdminSkeleton from "../components/AdminSkeleton";

type BlogCommentRow = {
  id: string;
  post_id: string | null;
  post_slug: string | null;
  name: string;
  email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const STATUS_TABS = ["pending", "approved", "rejected", "all"] as const;

export default function AdminBlogCommentsPage() {
  const [comments, setComments] = useState<BlogCommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog-comments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load comments");
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "all") return comments;
    return comments.filter((comment) => comment.status === activeTab);
  }, [activeTab, comments]);

  const counts = useMemo(() => ({
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
  }), [comments]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/blog-comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update comment");

      setComments((prev) =>
        prev.map((comment) => (comment.id === id ? { ...comment, status } : comment)),
      );
      toast.success(status === "approved" ? "Comment approved" : "Comment rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update comment");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Delete this comment permanently?")) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/blog-comments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete comment");

      setComments((prev) => prev.filter((comment) => comment.id !== id));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Blog Comments</h1>
        <p className="text-sm text-gray-500 font-sans mt-1">
          Approve or reject comments before they appear on blog posts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-bold font-sans capitalize transition-colors ${
              activeTab === tab
                ? "bg-[#ff5e00] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#ff5e00]"
            }`}
          >
            {tab}
            {tab === "pending" && counts.pending > 0 ? ` (${counts.pending})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center font-sans text-gray-600">
          No {activeTab === "all" ? "" : activeTab} comments.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((comment) => (
            <article
              key={comment.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-gray-900 font-sans">{comment.name}</p>
                  <p className="text-sm text-gray-500 font-sans">{comment.email}</p>
                  <p className="text-xs text-gray-400 font-sans mt-1">
                    {format(new Date(comment.created_at), "PPp")}
                    {comment.post_slug ? (
                      <>
                        {" "}
                        · on <span className="font-semibold text-[#0060cc]">{comment.post_slug}</span>
                      </>
                    ) : null}
                  </p>
                </div>
                <span
                  className={`self-start rounded-full px-3 py-1 text-xs font-bold font-sans capitalize ${
                    comment.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : comment.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {comment.status}
                </span>
              </div>

              <p className="text-sm text-gray-700 font-sans leading-relaxed whitespace-pre-wrap mb-4">
                {comment.content}
              </p>

              <div className="flex flex-wrap gap-2">
                {comment.status !== "approved" ? (
                  <button
                    type="button"
                    disabled={updatingId === comment.id}
                    onClick={() => updateStatus(comment.id, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60 font-sans"
                  >
                    <CheckmarkBadge01Icon size={16} />
                    Approve
                  </button>
                ) : null}
                {comment.status !== "rejected" ? (
                  <button
                    type="button"
                    disabled={updatingId === comment.id}
                    onClick={() => updateStatus(comment.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-300 disabled:opacity-60 font-sans"
                  >
                    <Cancel01Icon size={16} />
                    Reject
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={updatingId === comment.id}
                  onClick={() => deleteComment(comment.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 font-sans"
                >
                  <Delete02Icon size={16} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
