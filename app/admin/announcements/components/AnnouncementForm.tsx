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

interface AnnouncementFormProps {
  initialData?: any;
}

export default function AnnouncementForm({ initialData }: AnnouncementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    type: initialData?.type || "Alert",
    content: initialData?.content || "",
    image_url: initialData?.image_url || "",
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
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
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
      const announcementInput = {
        title: formData.title,
        type: formData.type,
        content: formData.content,
        image_url: formData.image_url,
      };

      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementInput,
          announcementId: initialData?.id
        })
      });

      if (!res.ok) throw new Error("Failed to save announcement");

      toast.success("Announcement saved!");
      router.push('/admin/announcements');
      router.refresh();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Title</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Type (e.g. Alert, Info, Promo)</label>
          <input type="text" name="type" required value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black" />
        </div>
        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Cover Image URL (Optional)</label>
           <div className="flex gap-2">
             <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black" placeholder="https://... or upload ->" />
             <label className={`px-4 py-2 bg-[#ff5e00] rounded-lg cursor-pointer transition-colors flex items-center justify-center font-sans text-sm font-semibold ${uploadingImage ? 'opacity-50' : ''}`}>
               {uploadingImage ? 'Uploading...' : 'Upload'}
               <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
             </label>
           </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Content</label>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden font-sans">
          <ReactQuill 
            theme="snow" 
            value={formData.content} 
            onChange={handleQuillChange}
            className="h-64 mb-12"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <button type="button" onClick={() => router.push('/admin/announcements')} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-sans font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans font-semibold disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Announcement'}
        </button>
      </div>
    </form>
  );
}
