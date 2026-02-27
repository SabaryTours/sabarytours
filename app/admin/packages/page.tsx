"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Edit02Icon, Delete01Icon, PlusSignIcon } from "hugeicons-react";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPackages(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete package");
      
      fetchPackages();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete the package. Make sure it has no tours attached to it.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage Packages</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">Create and arrange package categories.</p>
        </div>
        <Link 
          href="/admin/packages/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans text-sm font-semibold shadow-sm"
        >
          <PlusSignIcon size={18} />
          Create New Package
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Package</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Slug</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-sans">Loading packages...</td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-sans">No packages found.</td>
                </tr>
              ) : packages.map((pkg) => {
                const primaryImage = pkg.image || '/assets/placeholder-tour.jpg';
                
                return (
                  <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={primaryImage} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 font-sans line-clamp-1">{pkg.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-sans">
                        {pkg.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/packages/${pkg.id}`}
                          className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit02Icon size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(pkg.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Delete01Icon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
