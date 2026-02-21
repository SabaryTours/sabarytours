"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import toast from "react-hot-toast";

interface PackageFormProps {
  initialData?: any;
}

export default function PackageForm({ initialData }: PackageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({ ...prev, image: data.secure_url }));
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
      const packageInput = {
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: formData.description,
        image: formData.image,
      };

      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageInput,
          packageId: initialData?.id
        })
      });

      if (!res.ok) throw new Error("Failed to save package via API");

      toast.success("Package saved successfully!");
      router.push('/admin/packages');
      router.refresh();
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error("Failed to save package.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Title</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-800" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Description</label>
          <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-800" />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Image URL</label>
           <div className="flex gap-2">
             <input type="url" name="image" value={formData.image} onChange={handleChange} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-black" placeholder="https://... or upload ->" />
             <label className={`px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center font-sans text-sm font-semibold ${uploadingImage ? 'opacity-50' : ''}`}>
               {uploadingImage ? 'Uploading...' : 'Upload'}
               <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
             </label>
           </div>
           {formData.image && (
             <div className="mt-2 text-xs text-green-600 font-sans">✓ Image linked</div>
           )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <button type="button" onClick={() => router.push('/admin/packages')} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-sans font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans font-semibold disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Package'}
        </button>
      </div>
    </form>
  );
}
