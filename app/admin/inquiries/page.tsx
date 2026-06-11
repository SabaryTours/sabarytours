"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckmarkBadge01Icon,
  Delete01Icon,
  Mail02Icon,
  MapsIcon,
  Message01Icon,
} from "hugeicons-react";
import toast from "react-hot-toast";
import type { InquiryRecord } from "../../api/admin/inquiries/route";

type FilterTab = "all" | "general" | "customized_package";

function isUnread(status: string | null | undefined) {
  return status === "new" || status === "unread";
}

function typeLabel(type: string | null | undefined) {
  if (type === "customized_package") return "Custom trip request";
  if (type === "general") return "Contact form";
  return type || "Inquiry";
}

function typeBadgeClass(type: string | null | undefined) {
  if (type === "customized_package") {
    return "bg-[#fff7f0] text-[#ff5e00] border-[#ffdfcc]";
  }
  return "bg-[#f0f7ff] text-[#0060cc] border-[#cce4ff]";
}

export default function AdminInquiriesPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter === "all" ? "" : `?type=${filter}`;
      const res = await fetch(`/api/admin/inquiries${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setInquiries(data.inquiries || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load inquiries");
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const counts = useMemo(() => {
    const contact = inquiries.filter((i) => i.type === "general").length;
    const custom = inquiries.filter((i) => i.type === "customized_package").length;
    const unread = inquiries.filter((i) => isUnread(i.status)).length;
    return { contact, custom, unread, all: inquiries.length };
  }, [inquiries]);

  const markAsRead = async (id: string, currentStatus: string | null) => {
    if (!isUnread(currentStatus)) return;
    const res = await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "read" }),
    });
    if (!res.ok) {
      toast.error("Failed to mark as read");
      return;
    }
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: "read" } : inq)),
    );
    toast.success("Marked as read");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Failed to delete");
      return;
    }
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    if (expandedId === id) setExpandedId(null);
    toast.success("Deleted");
  };

  const tabs: { id: FilterTab; label: string; icon: typeof Message01Icon }[] = [
    { id: "all", label: "All messages", icon: Message01Icon },
    { id: "general", label: "Contact form", icon: Mail02Icon },
    { id: "customized_package", label: "Custom trip requests", icon: MapsIcon },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Messages &amp; trip requests</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">
          Contact form submissions and customized package requests — stored here after customers submit.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-sans border transition-colors ${
                active
                  ? "bg-[#ff5e00] text-white border-[#ff5e00]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#ff5e00]/40"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 font-sans">
          Loading messages…
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 font-sans">
          No messages in this section yet.
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const expanded = expandedId === inq.id;
            const unread = isUnread(inq.status);
            return (
              <article
                key={inq.id}
                className={`rounded-xl border bg-white shadow-sm font-sans overflow-hidden ${
                  unread ? "border-[#ff5e00]/40 border-l-4 border-l-[#ff5e00]" : "border-gray-200"
                }`}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide border ${typeBadgeClass(inq.type)}`}
                        >
                          {typeLabel(inq.type)}
                        </span>
                        {unread && (
                          <span className="text-[11px] font-bold uppercase text-[#ff5e00]">New</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(inq.created_at).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-base font-bold text-gray-900">{inq.name}</p>
                      <a
                        href={`mailto:${inq.email}`}
                        className="text-sm text-[#0060cc] hover:underline break-all"
                      >
                        {inq.email}
                      </a>
                      {inq.phone && <p className="text-sm text-gray-500 mt-0.5">{inq.phone}</p>}
                      <p className="text-sm font-semibold text-gray-800 mt-3">
                        {inq.subject || "No subject"}
                      </p>
                      <p className={`text-sm text-gray-600 mt-2 whitespace-pre-wrap ${expanded ? "" : "line-clamp-3"}`}>
                        {inq.message}
                      </p>
                      {(inq.message?.length ?? 0) > 180 && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : inq.id)}
                          className="mt-2 text-xs font-bold text-[#0060cc] hover:text-[#ff5e00]"
                        >
                          {expanded ? "Show less" : "Show full message"}
                        </button>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <a
                        href={`mailto:${inq.email}?subject=${encodeURIComponent(`Re: ${inq.subject || "Your message to Sabary Tours"}`)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#0060cc] bg-[#f0f7ff] hover:bg-[#0060cc]/10"
                        onClick={() => markAsRead(inq.id, inq.status)}
                      >
                        <Mail02Icon size={16} />
                        Reply
                      </a>
                      {unread && (
                        <button
                          type="button"
                          onClick={() => markAsRead(inq.id, inq.status)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100"
                        >
                          <CheckmarkBadge01Icon size={16} />
                          Mark read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(inq.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100"
                      >
                        <Delete01Icon size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && filter === "all" && inquiries.length > 0 && (
        <p className="text-xs text-gray-400 font-sans">
          {counts.all} total · {counts.unread} new · {counts.contact} contact · {counts.custom} custom trips
        </p>
      )}
    </div>
  );
}
