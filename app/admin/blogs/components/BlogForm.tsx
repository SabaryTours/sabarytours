"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import dynamic from "next/dynamic";
import 'react-quill-new/dist/quill.snow.css';
import toast from "react-hot-toast";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false }
);

interface BlogFormProps {
  initialData?: any;
}

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    image_url: initialData?.image_url || "",
    status: initialData?.status || "published",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, image_url: data.secure_url }));
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const postInput = {
        title: formData.title,
        slug,
        summary: formData.summary,
        content: formData.content,
        image_url: formData.image_url,
        status: formData.status,
      };

      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postInput,
          blogId: initialData?.id
        })
      });

      if (!res.ok) throw new Error("Failed to save blog");

      toast.success("Article published!");
      router.push('/admin/blogs');
      router.refresh();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save article.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Title</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black" />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Summary (Short Excerpt)</label>
          <textarea name="summary" rows={3} value={formData.summary} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Cover Image</label>
          <div className="flex gap-2">
            <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black" placeholder="https://... or upload ->" />
            <label className={`px-4 py-2 bg-[#ff5e00] rounded-lg cursor-pointer transition-colors flex items-center justify-center font-sans text-sm font-semibold text-white ${uploadingImage ? 'opacity-50' : ''}`}>
              {uploadingImage ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </div>
          {formData.image_url && (
            <div className="mt-2 text-xs text-green-600 font-sans">✓ Image linked</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans bg-white">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Article Content</label>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden font-sans text-black placeholder:text-black">
          <ReactQuill 
            theme="snow" 
            value={formData.content} 
            onChange={handleQuillChange}
            className="h-64 mb-12 text-black placeholder:text-black"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-12">
        <button type="button" onClick={() => router.push('/admin/blogs')} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-sans font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans font-semibold disabled:opacity-50">
          {loading ? 'Saving...' : 'Publish Article'}
        </button>
      </div>
    </form>
  );
}
