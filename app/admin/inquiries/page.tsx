"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { CheckmarkBadge01Icon, Delete01Icon, Mail02Icon } from "hugeicons-react";
import toast from "react-hot-toast";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setInquiries(data);
    setLoading(false);
  };

  const markAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus === 'read') return;
    const supabase = createClient();
    const { error } = await supabase.from('inquiries').update({ status: 'read' }).eq('id', id);
    if (error) {
      toast.error("Failed to mark as read");
      return;
    }
    // Optimistically update local state instead of re-fetching from the database
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: 'read' } : inq))
    );
    toast.success("Marked as read");
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete inquiry");
      return;
    }
    // Optimistically update local state instead of re-fetching from the database
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Contact & Inquiries</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">View messages from the contact form and tour inquiries.</p>
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">No inquiries found.</div>
        ) : (
          inquiries.map((inq) => (
            <div key={inq.id} className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans flex flex-col gap-3 ${inq.status === "unread" ? "border-l-4 border-l-[#ff5e00]" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${inq.status === "unread" ? "bg-[#ff5e00]" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-sans ${inq.status === "unread" ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>{inq.name}</p>
                  <a href={`mailto:${inq.email}`} className="text-xs text-[#0060cc] hover:underline font-sans break-all">{inq.email}</a>
                  {inq.phone && <p className="text-xs text-gray-500 font-sans">{inq.phone}</p>}
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800 font-sans">{inq.subject || inq.type || "General Inquiry"}</p>
              <p className="text-xs text-gray-500 font-sans">{new Date(inq.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 font-sans line-clamp-3">{inq.message}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <a href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || "Your Inquiry")}`} className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg" title="Reply" onClick={() => markAsRead(inq.id, inq.status)}>
                  <Mail02Icon size={18} />
                </a>
                {inq.status === "unread" && (
                  <button onClick={() => markAsRead(inq.id, inq.status)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Mark as Read">
                    <CheckmarkBadge01Icon size={18} />
                  </button>
                )}
                <button onClick={() => handleDelete(inq.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-auto" title="Delete">
                  <Delete01Icon size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Sender</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Subject</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans max-w-sm">Message</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">Loading inquiries...</td></tr>
              ) : inquiries.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">No inquiries found.</td></tr>
              ) : inquiries.map((inq) => (
                <tr key={inq.id} className={`hover:bg-gray-50/50 transition-colors group ${inq.status === "unread" ? "bg-orange-50/30" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${inq.status === "unread" ? "bg-[#ff5e00]" : "bg-transparent"}`} />
                      <div>
                        <p className={`text-sm font-sans ${inq.status === "unread" ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>{inq.name}</p>
                        <a href={`mailto:${inq.email}`} className="text-xs text-[#0060cc] hover:underline font-sans">{inq.email}</a>
                        {inq.phone && <p className="text-xs text-gray-500 font-sans">{inq.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800 font-sans">{inq.subject || inq.type || "General Inquiry"}</p>
                    <p className="text-xs text-gray-500 font-sans">{new Date(inq.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 max-w-sm"><p className="text-sm text-gray-600 font-sans line-clamp-2">{inq.message}</p></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`mailto:${inq.email}?subject=Re: ${inq.subject || "Your Inquiry"}`} className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg" title="Reply via Email" onClick={() => markAsRead(inq.id, inq.status)}><Mail02Icon size={18} /></a>
                      {inq.status === "unread" && (
                        <button onClick={() => markAsRead(inq.id, inq.status)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Mark as Read"><CheckmarkBadge01Icon size={18} /></button>
                      )}
                      <button onClick={() => handleDelete(inq.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100" title="Delete"><Delete01Icon size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
