"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Edit02Icon, Delete01Icon, PlusSignIcon } from "hugeicons-react";
import BlogFilterBar, { BlogCategoryBadge, BlogTagList } from "../../components/BlogFilterBar";
import { getBlogCategoryLabel } from "../../lib/blogCategories";
import { normalizeBlogTags, tagMatchesParam } from "../../lib/blogTags";

type AdminBlogRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  image_url: string | null;
  view_count: number | null;
  comment_count: number | null;
  summary: string | null;
  category: string | null;
  tags: string[];
};

function mapBlogRow(row: Record<string, unknown>): AdminBlogRow {
  return {
    id: String(row.id),
    title: typeof row.title === "string" ? row.title : "",
    status: typeof row.status === "string" ? row.status : "draft",
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    image_url: typeof row.image_url === "string" ? row.image_url : null,
    view_count: typeof row.view_count === "number" ? row.view_count : 0,
    comment_count: typeof row.comment_count === "number" ? row.comment_count : 0,
    summary: typeof row.summary === "string" ? row.summary : "",
    category: typeof row.category === "string" ? row.category : null,
    tags: normalizeBlogTags(Array.isArray(row.tags) ? row.tags.filter(Boolean) : []),
  };
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<AdminBlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    void fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, status, created_at, image_url, view_count, comment_count, summary, category, tags")
      .order("created_at", { ascending: false });

    setBlogs((data || []).map((row) => mapBlogRow(row)));
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", id);
    await fetchBlogs();
  };

  const popularTags = useMemo(
    () => Array.from(new Set(blogs.flatMap((blog) => blog.tags))).sort((a, b) => a.localeCompare(b)),
    [blogs],
  );

  const filteredBlogs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return blogs.filter((blog) => {
      if (statusFilter !== "all" && blog.status !== statusFilter) return false;
      if (categoryFilter !== "all" && blog.category !== categoryFilter) return false;
      if (tagFilter && !blog.tags.some((tag) => tagMatchesParam(tag, tagFilter))) return false;

      if (!q) return true;

      const categoryLabel = getBlogCategoryLabel(blog.category)?.toLowerCase() ?? "";
      const haystack = [
        blog.title,
        blog.summary ?? "",
        categoryLabel,
        ...blog.tags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [blogs, query, categoryFilter, tagFilter, statusFilter]);

  const renderStatus = (status: string) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border ${
        status === "published"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-yellow-50 text-yellow-700 border-yellow-200"
      }`}
    >
      {status === "published" ? "Published" : "Draft"}
    </span>
  );

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

      <BlogFilterBar
        query={query}
        onQueryChange={setQuery}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        tag={tagFilter}
        onTagChange={setTagFilter}
        popularTags={popularTags}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        resultCount={filteredBlogs.length}
        searchPlaceholder="Search by title, summary, hashtag, or section..."
      />

      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
            Loading articles...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
            No articles match your filters.
          </div>
        ) : (
          filteredBlogs.map((blog) => {
            const primaryImage = blog.image_url || "/assets/placeholder-tour.jpg";
            return (
              <div
                key={blog.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-sans flex flex-col gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={primaryImage} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 font-sans line-clamp-2">{blog.title}</p>
                    <div className="mt-2">
                      <BlogCategoryBadge category={blog.category} size="xs" />
                    </div>
                  </div>
                </div>
                {blog.summary ? (
                  <p className="text-sm text-gray-600 font-sans line-clamp-2">{blog.summary}</p>
                ) : null}
                <BlogTagList tags={blog.tags} limit={5} />
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 font-sans">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500 font-sans">
                    {(blog.view_count ?? 0).toLocaleString()} views
                  </span>
                  {renderStatus(blog.status)}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Link
                    href={`/admin/blogs/${blog.id}`}
                    className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg"
                    title="Edit"
                  >
                    <Edit02Icon size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Delete01Icon size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Article
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Section
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Hashtags
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Views
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-sans">
                    Loading articles...
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-sans">
                    No articles match your filters.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => {
                  const primaryImage = blog.image_url || "/assets/placeholder-tour.jpg";
                  return (
                    <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-10 w-10 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image src={primaryImage} alt="" fill className="object-cover" unoptimized />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 font-sans line-clamp-1">{blog.title}</p>
                            {blog.summary ? (
                              <p className="text-xs text-gray-500 font-sans line-clamp-1 mt-0.5">{blog.summary}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <BlogCategoryBadge category={blog.category} size="xs" />
                      </td>
                      <td className="px-6 py-4 align-top max-w-[220px]">
                        <BlogTagList tags={blog.tags} limit={3} />
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="text-sm text-gray-600 font-sans">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="text-sm text-gray-600 font-sans">
                          {(blog.view_count ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">{renderStatus(blog.status)}</td>
                      <td className="px-6 py-4 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/blogs/${blog.id}`}
                            className="p-2 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg"
                            title="Edit"
                          >
                            <Edit02Icon size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Delete01Icon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
