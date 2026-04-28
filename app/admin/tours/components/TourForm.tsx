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
    description: initialData?.description || "",
    map_url: initialData?.map_url || "",
    is_featured: initialData?.is_featured || false,
  });
  const [priceTiers, setPriceTiers] = useState<
    Array<{ name: string; amount: number | string; currency: string }>
  >(
    initialData?.tour_prices?.length
      ? initialData.tour_prices.map((p: any) => ({
          name: p.name || "Base Price",
          amount: p.amount ?? 0,
          currency: p.currency || "GHS",
        }))
      : [
          { name: "Double Occupancy", amount: "", currency: "GHS" },
          { name: "Group (4+)", amount: "", currency: "GHS" },
        ]
  );
  const [imageInputs, setImageInputs] = useState<string[]>(
    initialData?.tour_images?.map((img: any) => img.image_url).filter(Boolean) || []
  );

  const [itinerary, setItinerary] = useState<any[]>(
    initialData?.itinerary || []
  );
  
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(
    initialData?.whats_included || []
  );
  const [exclusions, setExclusions] = useState<string[]>(
    initialData?.exclusions || []
  );
  const [whatToBring, setWhatToBring] = useState<string[]>(
    initialData?.what_to_bring || []
  );
  const [groupSizeOptions, setGroupSizeOptions] = useState<string[]>(
    initialData?.group_size_options || []
  );
  const [ageCategories, setAgeCategories] = useState<string[]>(
    initialData?.age_categories || []
  );
  const [languages, setLanguages] = useState<string[]>(
    initialData?.languages || []
  );

  const [availableDays, setAvailableDays] = useState<string[]>(
    initialData?.available_days || []
  );
  
  const [blockedDates, setBlockedDates] = useState<string[]>(
    initialData?.blocked_dates || []
  );
  
  const [timeSlots, setTimeSlots] = useState<string[]>(
    initialData?.time_slots || []
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
        setImageInputs((prev) => [...prev, data.secure_url]);
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

  const addImageInput = () => setImageInputs((prev) => [...prev, ""]);
  const removeImageInput = (index: number) =>
    setImageInputs((prev) => prev.filter((_, i) => i !== index));
  const updateImageInput = (index: number, value: string) =>
    setImageInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  const addPriceTier = () =>
    setPriceTiers((prev) => [...prev, { name: "", amount: "", currency: "GHS" }]);
  const removePriceTier = (index: number) =>
    setPriceTiers((prev) => prev.filter((_, i) => i !== index));
  const updatePriceTier = (
    index: number,
    field: "name" | "amount" | "currency",
    value: string
  ) =>
    setPriceTiers((prev) => {
      const next = [...prev];
      if (field === "amount") {
        next[index] = { ...next[index], [field]: value === "" ? "" : Number(value) };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });

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
  const addExclusionItem = () => setExclusions([...exclusions, ""]);
  const removeExclusionItem = (index: number) => setExclusions(exclusions.filter((_, i) => i !== index));
  const updateExclusionItem = (index: number, value: string) => {
    const newItems = [...exclusions];
    newItems[index] = value;
    setExclusions(newItems);
  };
  const addBringItem = () => setWhatToBring([...whatToBring, ""]);
  const removeBringItem = (index: number) => setWhatToBring(whatToBring.filter((_, i) => i !== index));
  const updateBringItem = (index: number, value: string) => {
    const newItems = [...whatToBring];
    newItems[index] = value;
    setWhatToBring(newItems);
  };
  const addGroupSizeOption = () => setGroupSizeOptions([...groupSizeOptions, ""]);
  const removeGroupSizeOption = (index: number) => setGroupSizeOptions(groupSizeOptions.filter((_, i) => i !== index));
  const updateGroupSizeOption = (index: number, value: string) => {
    const newItems = [...groupSizeOptions];
    newItems[index] = value;
    setGroupSizeOptions(newItems);
  };
  const addAgeCategory = () => setAgeCategories([...ageCategories, ""]);
  const removeAgeCategory = (index: number) => setAgeCategories(ageCategories.filter((_, i) => i !== index));
  const updateAgeCategory = (index: number, value: string) => {
    const newItems = [...ageCategories];
    newItems[index] = value;
    setAgeCategories(newItems);
  };
  const addLanguage = () => setLanguages([...languages, ""]);
  const removeLanguage = (index: number) => setLanguages(languages.filter((_, i) => i !== index));
  const updateLanguage = (index: number, value: string) => {
    const newItems = [...languages];
    newItems[index] = value;
    setLanguages(newItems);
  };

  const handleAvailableDayToggle = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addBlockedDate = () => setBlockedDates([...blockedDates, ""]);
  const removeBlockedDate = (index: number) => setBlockedDates(blockedDates.filter((_, i) => i !== index));
  const updateBlockedDate = (index: number, value: string) => {
    const newDates = [...blockedDates];
    newDates[index] = value;
    setBlockedDates(newDates);
  };

  const addTimeSlot = () => setTimeSlots([...timeSlots, "09:00 AM"]);
  const removeTimeSlot = (index: number) => setTimeSlots(timeSlots.filter((_, i) => i !== index));
  const updateTimeSlot = (index: number, value: string) => {
    const newSlots = [...timeSlots];
    newSlots[index] = value;
    setTimeSlots(newSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
        whats_included: whatsIncluded.filter((item) => item.trim() !== ""),
        exclusions: exclusions.filter((item) => item.trim() !== ""),
        what_to_bring: whatToBring.filter((item) => item.trim() !== ""),
        group_size_options: groupSizeOptions.filter((item) => item.trim() !== ""),
        age_categories: ageCategories.filter((item) => item.trim() !== ""),
        languages: languages.filter((item) => item.trim() !== ""),
        available_days: availableDays,
        blocked_dates: blockedDates.filter(d => d.trim() !== ""),
        time_slots: timeSlots.filter(t => t.trim() !== ""),
      };

      const imageUrls = imageInputs.map((url) => url.trim()).filter(Boolean);
      const normalizedPriceTiers = priceTiers
        .map((tier) => ({
          name: String(tier.name || "").trim(),
          amount:
            typeof tier.amount === "number"
              ? tier.amount
              : Number(String(tier.amount || "").trim()),
          currency: String(tier.currency || "GHS").trim() || "GHS",
        }))
        .filter((tier) => tier.name && Number.isFinite(tier.amount) && tier.amount >= 0);

      const response = await fetch('/api/admin/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: initialData?.id,
          tourInput,
          imagesInput: imageUrls,
          priceInput: normalizedPriceTiers
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
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans bg-white text-black placeholder:text-gray-800">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Pricing Structure */}
      <div className="border-t border-gray-100 pt-8">
        <h3 className="text-lg font-bold text-gray-800 font-sans mb-4">Pricing Structure</h3>
        <p className="text-sm text-gray-500 mb-5 font-sans">
          Add structured options shown on the tour details page.
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 font-sans">Group Size Options</label>
              <button type="button" onClick={addGroupSizeOption} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                + Add Option
              </button>
            </div>
            <div className="space-y-2">
              {groupSizeOptions.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateGroupSizeOption(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
                    placeholder="e.g. 1-3 guests, 4-8 guests"
                  />
                  <button type="button" onClick={() => removeGroupSizeOption(index)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg font-bold">X</button>
                </div>
              ))}
              {groupSizeOptions.length === 0 && <p className="text-gray-400 text-sm italic">No group options added yet.</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 font-sans">Age Categories</label>
              <button type="button" onClick={addAgeCategory} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                + Add Category
              </button>
            </div>
            <div className="space-y-2">
              {ageCategories.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateAgeCategory(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
                    placeholder="e.g. Infant, Child, Adult"
                  />
                  <button type="button" onClick={() => removeAgeCategory(index)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg font-bold">X</button>
                </div>
              ))}
              {ageCategories.length === 0 && <p className="text-gray-400 text-sm italic">No age categories added yet.</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 font-sans">Language Preferences</label>
              <button type="button" onClick={addLanguage} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                + Add Language
              </button>
            </div>
            <div className="space-y-2">
              {languages.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateLanguage(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
                    placeholder="e.g. English, French"
                  />
                  <button type="button" onClick={() => removeLanguage(index)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg font-bold">X</button>
                </div>
              ))}
              {languages.length === 0 && <p className="text-gray-400 text-sm italic">No languages added yet.</p>}
            </div>
          </div>
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

      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 font-sans">Pricing Tiers</label>
          <button type="button" onClick={addPriceTier} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
            + Add Pricing Tier
          </button>
        </div>
        <div className="space-y-3">
          {priceTiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={tier.name}
                onChange={(e) => updatePriceTier(index, "name", e.target.value)}
                className="md:col-span-5 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
                placeholder="Tier name (e.g. Double Occupancy)"
              />
              <select
                value={tier.currency}
                onChange={(e) => updatePriceTier(index, "currency", e.target.value)}
                className="md:col-span-2 px-4 py-2 border border-gray-200 rounded-lg bg-white outline-none font-sans text-black"
              >
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
              </select>
              <input
                type="number"
                min="0"
                value={tier.amount}
                onChange={(e) => updatePriceTier(index, "amount", e.target.value)}
                className="md:col-span-4 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
                placeholder="Amount"
              />
              <button type="button" onClick={() => removePriceTier(index)} className="md:col-span-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg font-bold">
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* What's Included Section */}
      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 font-sans">What&apos;s Included</label>
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

      {/* Exclusions Section */}
      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 font-sans">Exclusions</label>
          <button type="button" onClick={addExclusionItem} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-gray-200">
            + Add Item
          </button>
        </div>
        <div className="space-y-3">
          {exclusions.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateExclusionItem(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
                placeholder="e.g. Personal expenses"
              />
              <button type="button" onClick={() => removeExclusionItem(index)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg font-bold">X</button>
            </div>
          ))}
          {exclusions.length === 0 && <p className="text-gray-400 text-sm italic">No exclusions added yet.</p>}
        </div>
      </div>

      {/* What To Bring Section */}
      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 font-sans">What to Bring</label>
          <button type="button" onClick={addBringItem} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-gray-200">
            + Add Item
          </button>
        </div>
        <div className="space-y-3">
          {whatToBring.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateBringItem(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
                placeholder="e.g. Hat, sunscreen, comfortable shoes"
              />
              <button type="button" onClick={() => removeBringItem(index)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg font-bold">X</button>
            </div>
          ))}
          {whatToBring.length === 0 && <p className="text-gray-400 text-sm italic">No items added yet.</p>}
        </div>
      </div>


      {/* Image URLs */}
      <div className="relative mt-8 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 font-sans">Tour Images</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={addImageInput} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200">
              + Add Image URL
            </button>
            <label className={`px-3 py-1 bg-[#ff5e00] rounded-lg cursor-pointer transition-colors flex items-center justify-center font-sans text-xs font-semibold text-white ${uploadingImage ? 'opacity-50' : ''}`}>
            {uploadingImage ? 'Uploading...' : '+ Upload to Cloudinary'}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
          </label>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-3 font-sans">Tip: Upload image files directly, or paste URLs manually below. First image becomes primary.</p>
        <div className="space-y-3">
          {imageInputs.map((url, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageInput(index, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-800"
                  placeholder="https://..."
                />
                {url ? (
                  <p className="text-xs text-gray-400 mt-1 font-sans truncate">{url}</p>
                ) : null}
              </div>
              <button type="button" onClick={() => removeImageInput(index)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg font-bold">
                X
              </button>
            </div>
          ))}
          {imageInputs.length === 0 && <p className="text-gray-400 text-sm italic">No images added yet.</p>}
        </div>
      </div>

      {/* Availability Section */}
      <div className="border-t border-gray-100 pt-8 pb-4">
        <h3 className="text-lg font-bold text-gray-800 font-sans mb-4">Availability & Calendar Rules</h3>
        <p className="text-sm text-gray-500 mb-6 font-sans">Set the days and times this tour is available. If no days are selected, the tour runs every day.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Available Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-3">Available Days of the Week</label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleAvailableDayToggle(day)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    availableDays.includes(day) 
                      ? 'bg-[#ff5e00] text-white border-[#ff5e00]' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-[#ff5e00] hover:text-[#ff5e00]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {availableDays.length === 0 && <p className="text-xs text-gray-400 mt-2 italic">Tour runs every day</p>}
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 font-sans">Tour Time Slots</label>
              <button type="button" onClick={addTimeSlot} className="px-3 py-1 bg-gray-100 text-[#ff5e00] rounded-lg text-xs font-semibold hover:bg-gray-200">
                + Add Time Slot
              </button>
            </div>
            <div className="space-y-2">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
                  />
                  <button type="button" onClick={() => removeTimeSlot(index)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg font-bold">X</button>
                </div>
              ))}
              {timeSlots.length === 0 && <p className="text-xs text-gray-400 italic">Guests can pick any time</p>}
            </div>
          </div>
        </div>

        {/* Blocked Dates */}
        <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 font-sans">Blocked / Blackout Dates</label>
              <button type="button" onClick={addBlockedDate} className="px-3 py-1 bg-gray-100 text-red-500 rounded-lg text-xs font-semibold hover:bg-gray-200">
                + Add Blocked Date
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Specific dates when this tour will not run (e.g. Holidays).</p>
            <div className="flex flex-wrap gap-2">
              {blockedDates.map((date, index) => (
                <div key={index} className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg p-1 pr-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => updateBlockedDate(index, e.target.value)}
                    className="px-3 py-1.5 bg-transparent border-none focus:ring-0 outline-none font-sans text-red-700 text-sm"
                  />
                  <button type="button" onClick={() => removeBlockedDate(index)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full font-bold text-xs">X</button>
                </div>
              ))}
              {blockedDates.length === 0 && <p className="text-xs text-gray-400 italic py-2">No blackout dates added</p>}
            </div>
        </div>
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
