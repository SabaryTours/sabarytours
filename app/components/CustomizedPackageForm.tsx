"use client";

import { useState } from "react";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { ZodError } from "zod";
import {
  ACCOMMODATION_AREAS,
  ACCOMMODATION_PREFERENCES,
  CONTACT_METHODS,
  PICKUP_LOCATIONS,
  PLANNING_STAGES,
  TOUR_PREFERENCES,
  TRANSPORT_PREFERENCES,
  TRAVEL_PRIORITIES,
  TRAVELER_TYPES,
  TRIP_FEELS,
} from "../lib/customizedPackageOptions";
import {
  customizedPackageSchema,
  type CustomizedPackageFormData,
} from "../lib/validations/customizedPackage";

const initialForm: CustomizedPackageFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organisationOrIndividual: "",
  numberOfPeople: "",
  preferredDate: "",
  budgetRange: "",
  pickupLocation: "Not sure yet",
  travelerType: "Solo Traveler",
  travelerTypeOther: "",
  accommodationPreference: "",
  accommodationArea: "",
  tourPreferences: [],
  tourPreferencesOther: "",
  travelPriority: "Cultural Immersion",
  planningStage: "Just exploring",
  contactMethod: "WhatsApp",
  tripFeel: "Balanced Mix of Activities",
  transportPreference: "Not sure — recommend for me",
  tripDetails: "",
  dietaryRequirements: "",
  specialOccasion: "",
  subscribeNewsletter: true,
};

function SectionTitle({
  emoji,
  title,
  subtitle,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-gray-100 pb-3 mb-5">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        {emoji ? <span aria-hidden>{emoji}</span> : null}
        {title}
      </h2>
      {subtitle ? (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      ) : null}
    </div>
  );
}

function RadioGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#ff5e00]/40 cursor-pointer has-checked:border-[#ff5e00] has-checked:bg-[#fff8f3]"
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="mt-1 accent-[#ff5e00]"
          />
          <span className="text-sm text-gray-800">{opt}</span>
        </label>
      ))}
      {error ? <p className="text-red-500 text-xs">{error}</p> : null}
    </div>
  );
}

export default function CustomizedPackageForm() {
  const [formData, setFormData] = useState<CustomizedPackageFormData>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomizedPackageFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearError(name as keyof CustomizedPackageFormData);
  };

  const clearError = (name: keyof CustomizedPackageFormData) => {
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const toggleTourPreference = (pref: (typeof TOUR_PREFERENCES)[number]) => {
    setFormData((prev) => {
      const has = prev.tourPreferences.includes(pref);
      return {
        ...prev,
        tourPreferences: has
          ? prev.tourPreferences.filter((p) => p !== pref)
          : [...prev.tourPreferences, pref],
      };
    });
    clearError("tourPreferences");
  };

  const fieldClass = (name: keyof CustomizedPackageFormData) =>
    `w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5e00]/20 focus:border-[#ff5e00] ${
      errors[name] ? "border-red-400" : "border-gray-200"
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      customizedPackageSchema.parse(formData);
      setErrors({});
    } catch (err) {
      if (err instanceof Error && "issues" in err) {
        const zodError = err as ZodError;
        const fieldErrors: Partial<
          Record<keyof CustomizedPackageFormData, string>
        > = {};
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

  return (
    <form onSubmit={handleSubmit} className="space-y-10 font-sans">
      <SectionTitle
        title="Your details"
        subtitle="We'll use this to prepare your personalized itinerary."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">First name *</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={fieldClass("firstName")}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Last name *</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={fieldClass("lastName")}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">
          Name of organisation or individual *
        </label>
        <input
          name="organisationOrIndividual"
          value={formData.organisationOrIndividual}
          onChange={handleChange}
          className={fieldClass("organisationOrIndividual")}
          placeholder="e.g. Acme Corp or The Mensah Family"
        />
        {errors.organisationOrIndividual && (
          <p className="text-red-500 text-xs mt-1">
            {errors.organisationOrIndividual}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={fieldClass("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Phone *</label>
          <PhoneInput
            country="gh"
            value={formData.phone.replace(/^\+/, "")}
            onChange={(v) => {
              setFormData((p) => ({ ...p, phone: v ? `+${v}` : "" }));
              clearError("phone");
            }}
            inputClass="!w-full !py-3 !rounded-xl !border-gray-200"
            buttonClass="!rounded-l-xl"
            containerClass="!w-full"
            enableSearch
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Number of people *</label>
          <input
            name="numberOfPeople"
            value={formData.numberOfPeople}
            onChange={handleChange}
            className={fieldClass("numberOfPeople")}
            placeholder="e.g. 12"
          />
          {errors.numberOfPeople && (
            <p className="text-red-500 text-xs mt-1">{errors.numberOfPeople}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Preferred date *</label>
          <input
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            className={fieldClass("preferredDate")}
            placeholder="e.g. March 2026 or flexible"
          />
          {errors.preferredDate && (
            <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Budget range *</label>
          <input
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            className={fieldClass("budgetRange")}
            placeholder="e.g. GHS 5,000–10,000"
          />
          {errors.budgetRange && (
            <p className="text-red-500 text-xs mt-1">{errors.budgetRange}</p>
          )}
        </div>
      </div>

      <SectionTitle
        emoji="👥"
        title="Traveler type"
        subtitle="Tell us who is traveling so we can design the right experience."
      />
      <RadioGroup
        name="travelerType"
        options={TRAVELER_TYPES}
        value={formData.travelerType}
        onChange={(v) => {
          setFormData((p) => ({ ...p, travelerType: v }));
          clearError("travelerType");
        }}
        error={errors.travelerType}
      />
      {formData.travelerType === "Other" && (
        <input
          name="travelerTypeOther"
          value={formData.travelerTypeOther}
          onChange={handleChange}
          className={fieldClass("travelerTypeOther")}
          placeholder="Please specify"
        />
      )}
      {errors.travelerTypeOther && (
        <p className="text-red-500 text-xs">{errors.travelerTypeOther}</p>
      )}

      <SectionTitle emoji="🚗" title="Pickup location" />
      <RadioGroup
        name="pickupLocation"
        options={PICKUP_LOCATIONS}
        value={formData.pickupLocation}
        onChange={(v) => {
          setFormData((p) => ({ ...p, pickupLocation: v }));
          clearError("pickupLocation");
        }}
        error={errors.pickupLocation}
      />

      <SectionTitle emoji="🚗" title="Transport preference" />
      <RadioGroup
        name="transportPreference"
        options={TRANSPORT_PREFERENCES}
        value={formData.transportPreference}
        onChange={(v) => {
          setFormData((p) => ({ ...p, transportPreference: v }));
          clearError("transportPreference");
        }}
        error={errors.transportPreference}
      />

      <SectionTitle
        emoji="🏨"
        title="Accommodation preference"
        subtitle="Optional — we can recommend the best fit for your trip."
      />
      <div className="space-y-2">
        <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer has-checked:border-[#ff5e00] has-checked:bg-[#fff8f3]">
          <input
            type="radio"
            name="accommodationPreference"
            checked={!formData.accommodationPreference}
            onChange={() =>
              setFormData((p) => ({ ...p, accommodationPreference: "" }))
            }
            className="mt-1 accent-[#ff5e00]"
          />
          <span className="text-sm text-gray-800">No preference yet</span>
        </label>
        {ACCOMMODATION_PREFERENCES.map((opt) => (
          <label
            key={opt}
            className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#ff5e00]/40 cursor-pointer has-checked:border-[#ff5e00] has-checked:bg-[#fff8f3]"
          >
            <input
              type="radio"
              name="accommodationPreference"
              checked={formData.accommodationPreference === opt}
              onChange={() =>
                setFormData((p) => ({ ...p, accommodationPreference: opt }))
              }
              className="mt-1 accent-[#ff5e00]"
            />
            <span className="text-sm text-gray-800">{opt}</span>
          </label>
        ))}
      </div>

      <SectionTitle title="Preferred accommodation area" subtitle="Optional" />
      <div className="space-y-2">
        <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer has-checked:border-[#ff5e00] has-checked:bg-[#fff8f3]">
          <input
            type="radio"
            name="accommodationArea"
            checked={!formData.accommodationArea}
            onChange={() => setFormData((p) => ({ ...p, accommodationArea: "" }))}
            className="mt-1 accent-[#ff5e00]"
          />
          <span className="text-sm text-gray-800">No area preference yet</span>
        </label>
        {ACCOMMODATION_AREAS.map((opt) => (
          <label
            key={opt}
            className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#ff5e00]/40 cursor-pointer has-checked:border-[#ff5e00] has-checked:bg-[#fff8f3]"
          >
            <input
              type="radio"
              name="accommodationArea"
              checked={formData.accommodationArea === opt}
              onChange={() => setFormData((p) => ({ ...p, accommodationArea: opt }))}
              className="mt-1 accent-[#ff5e00]"
            />
            <span className="text-sm text-gray-800">{opt}</span>
          </label>
        ))}
      </div>

      <SectionTitle
        title="Tour preference"
        subtitle="What experiences would you like included? Select all that apply."
      />
      <div className="grid sm:grid-cols-2 gap-2">
        {TOUR_PREFERENCES.map((pref) => (
          <label
            key={pref}
            className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#ff5e00]/40 cursor-pointer has-checked:border-[#ff5e00] has-checked:bg-[#fff8f3]"
          >
            <input
              type="checkbox"
              checked={formData.tourPreferences.includes(pref)}
              onChange={() => toggleTourPreference(pref)}
              className="mt-1 accent-[#ff5e00]"
            />
            <span className="text-sm text-gray-800">{pref}</span>
          </label>
        ))}
      </div>
      {errors.tourPreferences && (
        <p className="text-red-500 text-xs">{errors.tourPreferences}</p>
      )}
      {formData.tourPreferences.includes("Other") && (
        <input
          name="tourPreferencesOther"
          value={formData.tourPreferencesOther}
          onChange={handleChange}
          className={fieldClass("tourPreferencesOther")}
          placeholder="Other experiences (please specify)"
        />
      )}
      {errors.tourPreferencesOther && (
        <p className="text-red-500 text-xs">{errors.tourPreferencesOther}</p>
      )}

      <SectionTitle
        title="Travel priority"
        subtitle="What matters most for your trip?"
      />
      <RadioGroup
        name="travelPriority"
        options={TRAVEL_PRIORITIES}
        value={formData.travelPriority}
        onChange={(v) => {
          setFormData((p) => ({ ...p, travelPriority: v }));
          clearError("travelPriority");
        }}
        error={errors.travelPriority}
      />

      <SectionTitle title="How far along are you in planning?" />
      <RadioGroup
        name="planningStage"
        options={PLANNING_STAGES}
        value={formData.planningStage}
        onChange={(v) => {
          setFormData((p) => ({ ...p, planningStage: v }));
          clearError("planningStage");
        }}
        error={errors.planningStage}
      />

      <SectionTitle title="How would you like your trip to feel?" />
      <RadioGroup
        name="tripFeel"
        options={TRIP_FEELS}
        value={formData.tripFeel}
        onChange={(v) => {
          setFormData((p) => ({ ...p, tripFeel: v }));
          clearError("tripFeel");
        }}
        error={errors.tripFeel}
      />

      <SectionTitle emoji="📲" title="Preferred contact method" />
      <RadioGroup
        name="contactMethod"
        options={CONTACT_METHODS}
        value={formData.contactMethod}
        onChange={(v) => {
          setFormData((p) => ({ ...p, contactMethod: v }));
          clearError("contactMethod");
        }}
        error={errors.contactMethod}
      />

      <SectionTitle
        title="Tell us more about your trip"
        subtitle="Any special requests, places you want to visit, or ideas you have in mind."
      />
      <textarea
        name="tripDetails"
        rows={5}
        value={formData.tripDetails}
        onChange={handleChange}
        className={fieldClass("tripDetails")}
        placeholder="Share your vision for the perfect Ghana trip…"
      />

      <div>
        <label className="block text-sm font-bold mb-1">Special occasion</label>
        <input
          name="specialOccasion"
          value={formData.specialOccasion}
          onChange={handleChange}
          className={fieldClass("specialOccasion")}
          placeholder="Birthday, corporate retreat, honeymoon…"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">
          Dietary requirements or special needs
        </label>
        <textarea
          name="dietaryRequirements"
          rows={2}
          value={formData.dietaryRequirements}
          onChange={handleChange}
          className={fieldClass("dietaryRequirements")}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="subscribeNewsletter"
          checked={formData.subscribeNewsletter}
          onChange={handleChange}
          className="rounded border-gray-300 accent-[#ff5e00]"
        />
        Subscribe to our newsletter for travel tips and updates
      </label>

      {status === "success" && (
        <p className="text-green-700 text-sm font-medium">{message}</p>
      )}
      {status === "error" && (
        <p className="text-red-600 text-sm font-medium">{message}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl bg-[#ff5e00] text-white font-bold hover:bg-[#e55500] disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Submit customized trip request"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Prefer a ready-made tour?{" "}
        <Link
          href="/featured-tours"
          className="text-[#0060cc] font-semibold hover:text-[#ff5e00]"
        >
          Browse featured tours
        </Link>
        {" · "}
        <Link
          href="/packages"
          className="text-[#0060cc] font-semibold hover:text-[#ff5e00]"
        >
          All packages
        </Link>
      </p>
    </form>
  );
}
