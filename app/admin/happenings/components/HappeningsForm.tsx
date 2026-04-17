"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface HappeningsFormProps {
  initialData?: any;
}

export default function HappeningsForm({ initialData }: HappeningsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    status: initialData?.status || "ongoing",
    image_url: initialData?.image_url || "",
    link_url: initialData?.link_url || "",
    is_active: initialData?.is_active ?? true,
    sort_order:
      typeof initialData?.sort_order === "number" ? initialData.sort_order : 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    const newValue =
      type === "checkbox" && target instanceof HTMLInputElement
        ? target.checked
        : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setError(null);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          image_url: data.secure_url,
        }));
      } else {
        setError(data.error || "Image upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
      // reset file input value so the same file can be reselected if needed
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        status: formData.status,
        image_url: formData.image_url.trim(),
        link_url: formData.link_url.trim() || null,
        is_active: formData.is_active,
        sort_order: Number.isFinite(formData.sort_order)
          ? formData.sort_order
          : 0,
      };

      const res = await fetch(
        initialData
          ? `/api/admin/happenings/${initialData.id}`
          : "/api/admin/happenings",
        {
          method: initialData ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to save card");
      }

      router.push("/admin/happenings");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-sans">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-400"
            placeholder="Eg. Cape Coast Live Tour"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans bg-white text-black"
            >
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans mb-1">
              Sort Order
            </label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black"
            />
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Lower numbers appear first.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 font-sans">
              Background Image URL
            </label>
            <label
              className={`px-3 py-1 bg-[#ff5e00] rounded-lg cursor-pointer transition-colors flex items-center justify-center font-sans text-xs font-semibold text-white ${
                uploadingImage ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploadingImage ? "Uploading..." : "+ Upload to Cloudinary"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          </div>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-400"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans mb-1">
            YouTube Link (optional)
          </label>
          <input
            type="url"
            name="link_url"
            value={formData.link_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5e00] outline-none font-sans text-black placeholder:text-gray-400"
            placeholder="https://youtube.com/..."
          />
          <p className="text-xs text-gray-400 mt-1 font-sans">
            If provided, clicking the card will open this link in a new tab.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <input
            id="is_active"
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 text-[#ff5e00] border-gray-300 rounded focus:ring-[#ff5e00]"
          />
          <label
            htmlFor="is_active"
            className="text-sm font-medium text-gray-700 font-sans"
          >
            Show this card on the home page
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push("/admin/happenings")}
          className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-sans text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-[#ff5e00] text-white rounded-lg hover:bg-[#e55500] transition-colors font-sans text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : initialData ? "Save Changes" : "Create Card"}
        </button>
      </div>
    </form>
  );
}

