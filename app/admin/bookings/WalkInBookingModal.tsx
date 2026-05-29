"use client";

import { useState } from "react";
import { MailSend01Icon } from "hugeicons-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface Props {
  availableTours: { id: string; title: string }[];
  onClose: () => void;
  onSuccess: (booking: any) => void;
}

export default function WalkInBookingModal({ availableTours, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tourName, setTourName] = useState("");
  const [isCustomTour, setIsCustomTour] = useState(false);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("1");
  const [totalCost, setTotalCost] = useState("");
  const [includedActivities, setIncludedActivities] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !tourName || !date || !totalCost) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/bookings/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          tour_name: tourName,
          date,
          time_slot: timeSlot,
          number_of_people: numberOfPeople,
          total_cost: totalCost,
          included_activities: includedActivities,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking");

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create Walk-in (Invoice) Booking</h2>
          <p className="text-sm text-gray-500 mt-1">Logs the booking and emails the client an invoice with all payment options.</p>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="walkin-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Client Section */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Client Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                  <PhoneInput
                    country="gh"
                    value={customerPhone}
                    onChange={(val: string) => setCustomerPhone(val ? `+${val}` : "")}
                    enableSearch
                    searchPlaceholder="Search country..."
                    inputStyle={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "#ffffff",
                      fontSize: "14px",
                      color: "#111827",
                      paddingLeft: "52px",
                    }}
                    buttonStyle={{
                      borderRadius: "8px 0 0 8px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "#ffffff",
                    }}
                    containerStyle={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            {/* Tour Section */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Tour & Itinerary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tour / Package Name *</label>
                  <select
                    required={!isCustomTour}
                    value={isCustomTour ? "custom" : tourName}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomTour(true);
                        setTourName("");
                      } else {
                        setIsCustomTour(false);
                        setTourName(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm bg-white mb-2"
                  >
                    <option value="" disabled>Select a Tour Package</option>
                    <option value="custom">Create custom package</option>
                    {availableTours.map((t) => (
                      <option key={t.id} value={t.title}>{t.title}</option>
                    ))}
                  </select>

                  {isCustomTour && (
                    <input
                      type="text"
                      required
                      value={tourName}
                      onChange={(e) => setTourName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm mt-2"
                      placeholder="Type custom package name here..."
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Time Slot</label>
                  <input
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Amount Due (GHS) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">GHS</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={totalCost}
                      onChange={(e) => setTotalCost(e.target.value)}
                      className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Included Activities (for this booking)</label>
                  <textarea
                    value={includedActivities}
                    onChange={(e) => setIncludedActivities(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm min-h-[80px]"
                    placeholder="List any specific activities, upgrades, or notes included in this custom booking..."
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 font-medium">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors text-sm"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="walkin-form"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#ff5e00] text-white font-bold rounded-lg hover:bg-[#e55500] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MailSend01Icon size={18} />
                Log Booking & Email Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
