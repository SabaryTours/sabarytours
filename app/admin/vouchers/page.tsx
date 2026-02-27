"use client";

import { useState, useEffect } from "react";
import { Ticket01Icon, Delete01Icon, PlusSignIcon } from "hugeicons-react";
import toast from "react-hot-toast";

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newExpiry, setNewExpiry] = useState("");

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/admin/vouchers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch vouchers");
      setVouchers(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newDiscount) {
      toast.error("Code and discount are required");
      return;
    }

    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          discount_percentage: newDiscount,
          expiry_date: newExpiry || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Voucher created successfully!");
      setNewCode("");
      setNewDiscount("");
      setNewExpiry("");
      setIsCreating(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Voucher ${!currentActive ? 'activated' : 'disabled'}`);
      setVouchers(vouchers.map(v => v.id === id ? { ...v, active: !currentActive } : v));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete voucher");
      
      toast.success("Voucher deleted");
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans tracking-tight">Voucher Codes</h1>
          <p className="text-gray-500 font-sans text-sm mt-1">Manage discount and promo codes for bookings.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans text-sm font-semibold shadow-sm"
        >
          <PlusSignIcon size={18} />
          {isCreating ? "Cancel" : "Create Code"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Code / Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. SUMMER26"
              value={newCode} 
              onChange={e => setNewCode(e.target.value.toUpperCase())} 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans uppercase" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Discount (%)</label>
            <input 
              type="number" 
              min="1" max="100"
              required
              placeholder="10"
              value={newDiscount} 
              onChange={e => setNewDiscount(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Expiry Date (Optional)</label>
            <input 
              type="date" 
              value={newExpiry} 
              onChange={e => setNewExpiry(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-gray-600" 
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-sans font-semibold h-[42px]">
            Save Voucher
          </button>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white rounded-xl border border-gray-100"></div>
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
          <Ticket01Icon size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 font-sans mb-1">No vouchers yet</h3>
          <p className="text-gray-500 font-sans text-sm">Create your first promo code to boost sales.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-gray-50/80 border-b border-gray-100 uppercase text-[10px] tracking-wider text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Uses</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff5e00]">
                          <Ticket01Icon size={16} />
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{voucher.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm font-semibold">
                      {voucher.discount_percentage}% OFF
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {voucher.usage_count}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {voucher.expiry_date ? new Date(voucher.expiry_date).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggle(voucher.id, voucher.active)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                          voucher.active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {voucher.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(voucher.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Voucher"
                      >
                        <Delete01Icon size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
