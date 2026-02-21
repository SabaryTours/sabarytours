"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Edit02Icon, Delete01Icon, PlusSignIcon } from "hugeicons-react";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPartners(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    const supabase = createClient();
    await supabase.from('partners').delete().eq('id', id);
    fetchPartners();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage Partners</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">Manage the partner logos displayed on your site.</p>
        </div>
        <Link 
          href="/admin/partners/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans text-sm font-semibold shadow-sm"
        >
          <PlusSignIcon size={18} />
          Add Partner
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Partner</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Created At</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-sans">Loading partners...</td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-sans">No partners found.</td>
                </tr>
              ) : partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {partner.image_url ? (
                        <div className="h-10 w-24 relative rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                          <Image src={partner.image_url} alt={partner.name} fill className="object-contain" unoptimized />
                        </div>
                      ) : (
                        <div className="h-10 w-24 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">No Image</div>
                      )}
                      <p className="text-sm font-bold text-gray-800 font-sans line-clamp-1">{partner.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-sans">
                      {new Date(partner.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2  transition-opacity">
                      <Link 
                        href={`/admin/partners/${partner.id}`}
                        className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit02Icon size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(partner.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Delete01Icon size={18} />
                      </button>
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
