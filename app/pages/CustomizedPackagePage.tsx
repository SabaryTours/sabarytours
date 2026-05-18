"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  customizedPackageSchema,
  type CustomizedPackageFormData,
} from "../lib/validations/customizedPackage";
import type { ZodError } from "zod";

const initialForm: CustomizedPackageFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organisationOrIndividual: "",
  numberOfPeople: "",
  interests: "",
  preferredDate: "",
  budgetRange: "",
  specialOccasion: "",
  preferredDestination: "",
  duration: "",
  transportation: "",
  accommodation: "",
  dietaryRequirements: "",
  additionalNotes: "",
  subscribeNewsletter: true,
};

export default function CustomizedPackagePage() {
  const [formData, setFormData] = useState<CustomizedPackageFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomizedPackageFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof CustomizedPackageFormData]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof CustomizedPackageFormData];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      customizedPackageSchema.parse(formData);
      setErrors({});
    } catch (err) {
      if (err instanceof Error && "issues" in err) {
        const zodError = err as ZodError;
        const fieldErrors: Partial<Record<keyof CustomizedPackageFormData, string>> = {};
        zodError.issues.forEach((issue) => {
          const field = issue.path[0] as keyof CustomizedPackageFormData;
          if (field) fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
      }
      return;
    }

    setSubmitting(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/customized-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setStatus("success");
      setMessage(data.message || "Request sent!");
      setFormData(initialForm);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (name: keyof CustomizedPackageFormData) =>
    `w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] ${
      errors[name] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-white">
      <section className="relative pt-24 pb-12 bg-gradient-to-br from-[#0060cc] to-[#004a9e] text-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 text-center max-w-3xl">
          <h1
            className="text-3xl md:text-5xl uppercase font-bold mb-4"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            Customized package
          </h1>
          <p className="text-white/90 font-sans text-base leading-relaxed">
            Share your vision — we&apos;ll craft a tailored Ghana experience for your group,
            organisation, or special occasion.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 md:px-12 py-12 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">First name *</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} className={fieldClass("firstName")} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Last name *</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} className={fieldClass("lastName")} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Name of organisation or individual *</label>
            <input name="organisationOrIndividual" value={formData.organisationOrIndividual} onChange={handleChange} className={fieldClass("organisationOrIndividual")} placeholder="e.g. Acme Corp or The Mensah Family" />
            {errors.organisationOrIndividual && <p className="text-red-500 text-xs mt-1">{errors.organisationOrIndividual}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass("email")} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Phone *</label>
              <PhoneInput country="gh" value={formData.phone.replace(/^\+/, "")} onChange={(v) => setFormData((p) => ({ ...p, phone: v ? `+${v}` : "" }))} inputClass="!w-full !py-3 !rounded-xl !border-gray-200" buttonClass="!rounded-l-xl" containerClass="!w-full" enableSearch />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Number of people *</label>
              <input name="numberOfPeople" value={formData.numberOfPeople} onChange={handleChange} className={fieldClass("numberOfPeople")} placeholder="e.g. 12" />
              {errors.numberOfPeople && <p className="text-red-500 text-xs mt-1">{errors.numberOfPeople}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Preferred date *</label>
              <input name="preferredDate" value={formData.preferredDate} onChange={handleChange} className={fieldClass("preferredDate")} placeholder="e.g. March 2026 or flexible" />
              {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Interest(s) / preferred experience *</label>
            <textarea name="interests" rows={3} value={formData.interests} onChange={handleChange} className={fieldClass("interests")} placeholder="Culture, adventure, beaches, food tours…" />
            {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Budget range *</label>
            <input name="budgetRange" value={formData.budgetRange} onChange={handleChange} className={fieldClass("budgetRange")} placeholder="e.g. $3,000–$5,000 total" />
            {errors.budgetRange && <p className="text-red-500 text-xs mt-1">{errors.budgetRange}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Special occasion</label>
            <input name="specialOccasion" value={formData.specialOccasion} onChange={handleChange} className={fieldClass("specialOccasion")} placeholder="Birthday, corporate retreat, honeymoon…" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Preferred destination / area</label>
              <input name="preferredDestination" value={formData.preferredDestination} onChange={handleChange} className={fieldClass("preferredDestination")} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Duration of tour / trip</label>
              <input name="duration" value={formData.duration} onChange={handleChange} className={fieldClass("duration")} placeholder="e.g. 5 days" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Transportation preference</label>
              <input name="transportation" value={formData.transportation} onChange={handleChange} className={fieldClass("transportation")} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Accommodation preference</label>
              <input name="accommodation" value={formData.accommodation} onChange={handleChange} className={fieldClass("accommodation")} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Dietary requirements or special needs</label>
            <textarea name="dietaryRequirements" rows={2} value={formData.dietaryRequirements} onChange={handleChange} className={fieldClass("dietaryRequirements")} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Additional requests / notes</label>
            <textarea name="additionalNotes" rows={4} value={formData.additionalNotes} onChange={handleChange} className={fieldClass("additionalNotes")} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="subscribeNewsletter" checked={formData.subscribeNewsletter} onChange={handleChange} className="rounded border-gray-300" />
            Subscribe to our newsletter for travel tips and updates
          </label>

          {status === "success" && <p className="text-green-700 text-sm font-medium">{message}</p>}
          {status === "error" && <p className="text-red-600 text-sm font-medium">{message}</p>}

          <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl bg-[#ff5e00] text-white font-bold hover:bg-[#e55500] disabled:opacity-60">
            {submitting ? "Sending…" : "Submit customized package request"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Prefer a standard tour?{" "}
            <Link href="/packages" className="text-[#0060cc] font-semibold hover:text-[#ff5e00]">
              Browse our packages
            </Link>
          </p>
        </form>
      </section>
      <Footer />
    </div>
  );
}
