"use client";

import { useState, useEffect } from "react";
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

interface TourFormProps {
  initialData?: any;
}

export default function TourForm({ initialData }: TourFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "",
    location: initialData?.location || "Accra, Ghana",
    duration: initialData?.duration || "Full Day",
    status: initialData?.status || "published",
    currency: initialData?.currency || "GHS",
    price: initialData?.tour_prices?.[0]?.amount || 0,
    description: initialData?.description || "",
    map_url: initialData?.map_url || "",
    images: initialData?.tour_images?.map((img: any) => img.image_url).join('\n') || "",
    is_featured: initialData?.is_featured || false,
  });

  const [itinerary, setItinerary] = useState<any[]>(
    initialData?.itinerary || []
  );
  
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(
    initialData?.whats_included || []
  );

  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('packages').select('slug, title').order('title');
      if (data) {
        setPackages(data);
        if (!formData.category && data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0].slug }));
        }
      }
    };
    fetchPackages();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
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
        // Append the new URL to the existing images, separated by a newline
        setFormData(prev => {
          const newImages = prev.images ? `${prev.images}\n${data.secure_url}` : data.secure_url;
          return { ...prev, images: newImages };
        });
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

  const addItineraryDay = () => setItinerary([...itinerary, { day: itinerary.length + 1, title: "", description: "" }]);
  const removeItineraryDay = (index: number) => {
    const newItinerary = itinerary.filter((_, i) => i !== index);
    // Reassign day numbers
    setItinerary(newItinerary.map((item, i) => ({ ...item, day: i + 1 })));
  };
  const updateItineraryDay = (index: number, field: string, value: string) => {
    const newItinerary = [...itinerary];
    newItinerary[index] = { ...newItinerary[index], [field]: value };
    setItinerary(newItinerary);
  };

  const addIncludedItem = () => setWhatsIncluded([...whatsIncluded, ""]);
  const removeIncludedItem = (index: number) => setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
  const updateIncludedItem = (index: number, value: string) => {
    const newItems = [...whatsIncluded];
    newItems[index] = value;
    setWhatsIncluded(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    
    try {
      // 1. Prepare Data
      const tourInput = {
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category: formData.category,
        location: formData.location,
        duration: formData.duration,
        status: formData.status,
        description: formData.description,
        map_url: formData.map_url,
        is_featured: formData.is_featured,
        itinerary,
        whats_included: whatsIncluded,
      };

      const imageUrls = formData.images.split('\n').filter((url: string) => url.trim() !== '');

      const response = await fetch('/api/admin/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: initialData?.id,
          tourInput,
          imagesInput: imageUrls,
        }),
      });

      if (!response.ok) throw new Error("Failed to save tour via API");

      toast.success("Tour saved successfully!");
      router.push('/admin/tours');
      router.refresh();
    } catch (error) {
      console.error("Error saving tour:", error);
      toast.error("Failed to save tour.");
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
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Package / Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans bg-white text-black placeholder:text-gray-800">
            <option value="" disabled>Select a package</option>
            {packages.map(pkg => (
              <option key={pkg.slug} value={pkg.slug}>{pkg.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Duration</label>
          <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-800" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Google Maps Embed URL / Iframe src</label>
          <input type="url" name="map_url" value={formData.map_url} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-400" placeholder="https://www.google.com/maps/embed?pb=..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Base Price</label>
          <div className="flex">
            <select name="currency" value={formData.currency} onChange={handleChange} className="px-4 py-2 border border-gray-200 rounded-l-lg bg-gray-50 outline-none font-sans text-black placeholder:text-gray-800">
              <option value="GHS">GHS</option>
              <option value="USD">USD</option>
            </select>
            <input type="number" name="price" required value={formData.price} onChange={handleChange} className="flex-1 px-4 py-2 border-y border-r border-gray-200 rounded-r-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-800" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans bg-white text-black placeholder:text-gray-800">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Description</label>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden font-sans">
          <ReactQuill 
            theme="snow" 
            value={formData.description} 
            onChange={handleQuillChange}
            className="h-64 mb-12"
          />
        </div>
      </div>

      {/* What's Included Section */}
      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 font-sans">What's Included</label>
          <button type="button" onClick={addIncludedItem} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-gray-200">
            + Add Item
          </button>
        </div>
        <div className="space-y-3">
          {whatsIncluded.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input 
                type="text" 
                value={item} 
                onChange={(e) => updateIncludedItem(index, e.target.value)} 
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black" 
                placeholder="e.g. Airport transfers" 
              />
              <button type="button" onClick={() => removeIncludedItem(index)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg font-bold">X</button>
            </div>
          ))}
          {whatsIncluded.length === 0 && <p className="text-gray-400 text-sm italic">No items added yet.</p>}
        </div>
      </div>

      {/* Itinerary Section */}
      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 font-sans">Itinerary</label>
          <button type="button" onClick={addItineraryDay} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-gray-200">
            + Add Day
          </button>
        </div>
        <div className="space-y-4">
          {itinerary.map((day, index) => (
            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative group">
              <button type="button" onClick={() => removeItineraryDay(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-1 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity">X</button>
              <h4 className="font-bold text-gray-800 mb-3">Day {day.day}</h4>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={day.title} 
                  onChange={(e) => updateItineraryDay(index, "title", e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black" 
                  placeholder="Day Title (e.g. Arrival & City Tour)" 
                />
                <textarea 
                  value={day.description} 
                  onChange={(e) => updateItineraryDay(index, "description", e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black min-h-[80px]" 
                  placeholder="Describe the day's activities..." 
                />
              </div>
            </div>
          ))}
          {itinerary.length === 0 && <p className="text-gray-400 text-sm italic">No itinerary days added yet.</p>}
        </div>
      </div>


      {/* Image URLs */}
      <div className="relative mt-8 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700 font-sans">Image URLs (One per line)</label>
          <label className={`px-3 py-1 bg-[#ff5e00] rounded-lg cursor-pointer transition-colors flex items-center justify-center font-sans text-xs font-semibold text-white ${uploadingImage ? 'opacity-50' : ''}`}>
            {uploadingImage ? 'Uploading...' : '+ Upload to Cloudinary'}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
          </label>
        </div>
        <textarea name="images" rows={4} value={formData.images} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-800" placeholder="https://..." />
      </div>

      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          id="is_featured" 
          name="is_featured" 
          checked={formData.is_featured} 
          onChange={handleCheckboxChange} 
          className="w-5 h-5 accent-[#ff5e00] text-[#ff5e00] rounded focus:ring-[#ff5e00]" 
        />
        <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 font-sans cursor-pointer">
          Feature this tour on the landing page Hero section
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <button type="button" onClick={() => router.push('/admin/tours')} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-sans font-semibold">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans font-semibold disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Tour'}
        </button>
      </div>
    </form>
  );
}
