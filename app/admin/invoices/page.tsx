"use client";

import { useState, useEffect } from "react";
import { PlusSignIcon, Link01Icon, MailSend01Icon, Tick02Icon } from "hugeicons-react";
import { format } from "date-fns";

interface Invoice {
  id: string;
  client_name: string;
  client_email: string;
  description: string;
  amount: number;
  payment_url: string;
  reference: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Failed to load invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !description || !amount) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          description,
          amount: amount
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate invoice");
      }

      // Add to list optimistically
      setInvoices((prev) => [data, ...prev]);
      
      // Close modal and reset
      setIsModalOpen(false);
      setClientName("");
      setClientEmail("");
      setDescription("");
      setAmount("");
      
      setSuccessMsg("Invoice generated successfully! The client has been emailed the payment link.");
      setTimeout(() => setSuccessMsg(null), 5000);

    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Payment link copied to clipboard!");
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-sans">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-900">Manage Invoices</h1>
          <p className="text-sm text-gray-500 font-sans mt-1">Generate custom Paystack payment links for your clients.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#ff5e00] text-white px-5 py-2.5 rounded-lg font-bold font-sans hover:bg-[#e55500] transition-colors shadow-sm"
        >
          <PlusSignIcon size={20} />
          Create Invoice
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg flex items-center gap-3 font-sans shadow-sm">
          <Tick02Icon size={24} className="text-green-600 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white border text-sm font-sans border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-16 text-center text-gray-500 font-sans border-dashed border-2 m-8 rounded-xl border-gray-200 bg-gray-50">
            <MailSend01Icon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Invoices Yet</h3>
            <p>Click the button above to generate and send your first custom Paystack invoice.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Payment Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{inv.client_name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{inv.client_email}</div>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate" title={inv.description}>
                      {inv.description}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">
                      GHS {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          inv.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-amber-100 text-amber-800'}
                      `}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {format(new Date(inv.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {inv.payment_url ? (
                        <button
                          onClick={() => copyToClipboard(inv.payment_url)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#ff5e00] font-bold hover:text-[#e55500] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded transition-colors border border-orange-200"
                        >
                          <Link01Icon size={14} />
                          Copy Link
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Invoice</h2>
              <p className="text-sm text-gray-500 mt-1">This will instantly generate a Paystack link and email the client.</p>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="invoice-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] focus:border-transparent transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Email *</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] focus:border-transparent transition-all"
                    placeholder="e.g. VIP Safari Deposit (2 Guests)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (GHS) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">GHS</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-14 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 font-medium">
                    {error}
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="invoice-form"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#ff5e00] text-white font-bold rounded-lg hover:bg-[#e55500] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MailSend01Icon size={18} />
                    Create & Email Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
