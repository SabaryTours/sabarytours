"use client";

import { useEffect, useState } from "react";
import { Mail02Icon } from "hugeicons-react";
import toast from "react-hot-toast";

type NewsletterSubscriber = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter-subscribers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setSubscribers(data.subscribers || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Newsletter subscribers</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">
          Sign-ups from the footer, newsletter blocks, and tour forms (stored in{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">newsletter_subscribers</code>).
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-gray-500 font-sans">Loading subscribers…</p>
        ) : subscribers.length === 0 ? (
          <p className="p-8 text-center text-gray-500 font-sans">No subscribers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${sub.email}`}
                        className="inline-flex items-center gap-1.5 text-[#0060cc] hover:underline font-medium"
                      >
                        <Mail02Icon size={14} />
                        {sub.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {[sub.first_name, sub.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sub.source || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-xs font-semibold">
                        {sub.status || "subscribed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(sub.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && subscribers.length > 0 && (
        <p className="text-xs text-gray-400 font-sans">{subscribers.length} subscriber(s)</p>
      )}
    </div>
  );
}
