"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { PencilEdit01Icon, Delete01Icon, PlusSignIcon, ArrowUp01Icon, ArrowDown01Icon } from "hugeicons-react";
import Image from "next/image";

export interface HeroImage {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export default function HeroAdminPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('hero_images')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (data) setImages(data);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get Cloudinary signature from API
      const signResponse = await fetch('/api/upload/sign');
      const signData = await signResponse.json();
      
      if (!signResponse.ok) throw new Error(signData.error || 'Failed to get signature');

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', 'sabarytours/hero');

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.error?.message || 'Upload failed');

      // 3. Save to database
      const newOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) + 1 : 0;
      
      const supabase = createClient();
      await supabase
        .from('hero_images')
        .insert([{ image_url: uploadData.secure_url, display_order: newOrder, is_active: true }]);
      
      
      // 4. Reload images
      await loadImages();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please check console for details.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // Reset file input
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('hero_images')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      setImages(images.map(img => img.id === id ? { ...img, is_active: !currentStatus } : img));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this hero image?")) {
      const supabase = createClient();
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (!error) {
        setImages(images.filter(img => img.id !== id));
      }
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const newImages = [...images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap display_order values
    const tempOrder = newImages[index].display_order;
    newImages[index].display_order = newImages[swapIndex].display_order;
    newImages[swapIndex].display_order = tempOrder;

    // Update in DB
    const supabase = createClient();
    await supabase.from('hero_images').update({ display_order: newImages[index].display_order }).eq('id', newImages[index].id);
    await supabase.from('hero_images').update({ display_order: newImages[swapIndex].display_order }).eq('id', newImages[swapIndex].id);

    // Actually swap elements in array to immediately reflect in UI
    const tempElement = newImages[index];
    newImages[index] = newImages[swapIndex];
    newImages[swapIndex] = tempElement;

    setImages(newImages);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-900">Hero Images</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the dynamic background images on the home page.</p>
        </div>
        
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
            id="hero-upload"
            disabled={uploading}
          />
          <label 
            htmlFor="hero-upload" 
            className={`flex items-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-lg font-medium cursor-pointer hover:bg-[#e55500] transition-colors ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <PlusSignIcon size={20} />
            {uploading ? 'Uploading...' : 'Add Image'}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#ff5e00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-orange-50 text-[#ff5e00] rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusSignIcon size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Hero Images</h3>
          <p className="text-gray-500 mb-6">Upload an image to get started.</p>
          <label 
            htmlFor="hero-upload" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-lg font-medium cursor-pointer hover:bg-[#e55500] transition-colors"
          >
            <PlusSignIcon size={20} />
            Upload First Image
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 font-sans text-sm">Order</th>
                <th className="px-6 py-4 font-semibold text-gray-600 font-sans text-sm">Image</th>
                <th className="px-6 py-4 font-semibold text-gray-600 font-sans text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600 font-sans text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {images.map((img, index) => (
                <tr key={img.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1 w-min">
                      <button 
                        onClick={() => moveOrder(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded text-gray-500 hover:bg-gray-200 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <ArrowUp01Icon size={16} />
                      </button>
                      <span className="font-semibold text-gray-700">{img.display_order}</span>
                      <button 
                        onClick={() => moveOrder(index, 'down')}
                        disabled={index === images.length - 1}
                        className={`p-1 rounded text-gray-500 hover:bg-gray-200 ${index === images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <ArrowDown01Icon size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <Image 
                        src={img.image_url} 
                        alt="Hero Image" 
                        fill 
                        className="object-cover" 
                        unoptimized 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(img.id, img.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        img.is_active 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {img.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(img.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                      title="Delete Image"
                    >
                      <Delete01Icon size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
