"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Edit02Icon, Delete01Icon, PlusSignIcon } from "hugeicons-react";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select('id, title, status, created_at, image_url')
      .order('created_at', { ascending: false });
    
    if (data) setBlogs(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    const supabase = createClient();
    await supabase.from('posts').delete().eq('id', id);
    fetchBlogs();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage Blogs</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">Write, edit, and publish new articles.</p>
        </div>
        <Link 
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans text-sm font-semibold shadow-sm"
        >
          <PlusSignIcon size={18} />
          Create New Article
        </Link>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">Loading articles...</div>
        ) : blogs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">No articles found.</div>
        ) : (
          blogs.map((blog) => {
            const primaryImage = blog.image_url || "/assets/placeholder-tour.jpg";
            return (
              <div key={blog.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={primaryImage} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <p className="text-sm font-bold text-gray-800 font-sans line-clamp-2 flex-1 min-w-0">{blog.title}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-sans">{new Date(blog.created_at).toLocaleDateString()}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border ${blog.status === "published" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                    {blog.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Link href={`/admin/blogs/${blog.id}`} className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg" title="Edit"><Edit02Icon size={18} /></Link>
                  <button onClick={() => handleDelete(blog.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Delete01Icon size={18} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Article</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">Loading articles...</td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">No articles found.</td></tr>
              ) : blogs.map((blog) => {
                const primaryImage = blog.image_url || "/assets/placeholder-tour.jpg";
                return (
                  <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={primaryImage} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <p className="text-sm font-bold text-gray-800 font-sans line-clamp-1">{blog.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600 font-sans">{new Date(blog.created_at).toLocaleDateString()}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border ${blog.status === "published" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                        {blog.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/blogs/${blog.id}`} className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg" title="Edit"><Edit02Icon size={18} /></Link>
                        <button onClick={() => handleDelete(blog.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Delete01Icon size={18} /></button>
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
