"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import {
  CheckmarkBadge01Icon,
  Cancel01Icon,
  Invoice01Icon,
  PlusSignIcon,
  MailSend01Icon,
  Tick02Icon,
} from "hugeicons-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import AdminSkeleton from '../components/AdminSkeleton';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
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
  const [availableTours, setAvailableTours] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('bookings')
      .select('*, tours(title)')
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data);

    // Also fetch available tours for the dropdown
    const { data: toursData } = await supabase.from('tours').select('id, title').eq('status', 'published').order('title');
    if (toursData) setAvailableTours(toursData);

    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('bookings').update({ booking_status: status }).eq('id', id);
    fetchBookings();
  };

  const handleSubmitWalkIn = async (e: React.FormEvent) => {
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
          included_activities: includedActivities
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Add to list optimistically
      setBookings((prev) => [data, ...prev]);
      
      // Close modal and reset
      setIsModalOpen(false);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setTourName("");
      setDate("");
      setTimeSlot("");
      setNumberOfPeople("1");
      setTotalCost("");
      setIncludedActivities("");
      setIsCustomTour(false);
      
      setSuccessMsg("Walk-in Booking generated! The client has been emailed their invoice payment link.");
      setTimeout(() => setSuccessMsg(null), 6000);

    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage Bookings</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">View and manage customer bookings.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#ff5e00] text-white px-5 py-2.5 rounded-lg font-bold font-sans hover:bg-[#e55500] transition-colors shadow-sm"
        >
          <PlusSignIcon size={20} />
          Create Walk-in Booking
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg flex items-center gap-3 font-sans shadow-sm">
          <Tick02Icon size={24} className="text-green-600 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Mobile: cards (scroll vertically) */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
              <AdminSkeleton variant="table" rows={2} />
            </div>
          ))
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
            No bookings found.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3"
            >
              <div>
                <p className="text-sm font-bold text-gray-800 font-sans">{booking.customer_name}</p>
                <p className="text-xs text-gray-500 font-sans truncate">{booking.customer_email}</p>
                {booking.customer_phone && <p className="text-xs text-gray-500 font-sans">{booking.customer_phone}</p>}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 font-sans line-clamp-1">{booking.tours?.title || booking.package_name || "Unknown Tour"}</p>
                <p className="text-xs text-gray-500 font-sans">{booking.tour_date} {booking.time_slot ? `at ${booking.time_slot}` : ""}</p>
                <p className="text-xs text-gray-500 font-sans">{booking.number_of_people} Guests</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-gray-800 font-sans">GHS {Number(booking.total_cost ?? 0).toFixed(2)}</span>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full font-sans uppercase ${booking.payment_status === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {booking.payment_status || "Pending"} {booking.payment_option === "deposit" ? "(Deposit)" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className={`px-2 py-1 text-xs font-medium rounded-full font-sans capitalize ${booking.booking_status === "confirmed" ? "bg-blue-50 text-blue-700" : booking.booking_status === "cancelled" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                  {booking.booking_status || "Pending"}
                </span>
                <div className="flex gap-1">
                  <Link
                    href={`/admin/bookings/receipt/${booking.id}`}
                    className="p-1.5 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg"
                    title="Payment receipt (cash / bank / other)"
                  >
                    <Invoice01Icon size={18} />
                  </Link>
                  {booking.booking_status !== "confirmed" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(booking.id, "confirmed")}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Confirm"
                    >
                      <CheckmarkBadge01Icon size={18} />
                    </button>
                  )}
                  {booking.booking_status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(booking.id, "cancelled")}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Cancel"
                    >
                      <Cancel01Icon size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Tour & Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Payment</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8"><AdminSkeleton variant="table" rows={5} /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">No bookings found.</td></tr>
              ) : bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 font-sans">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500 font-sans">{booking.customer_email}</p>
                    <p className="text-xs text-gray-500 font-sans">{booking.customer_phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 font-sans line-clamp-1">{booking.tours?.title || booking.package_name || "Unknown Tour"}</p>
                    <p className="text-xs text-gray-500 font-sans">{booking.tour_date} {booking.time_slot ? `at ${booking.time_slot}` : ""}</p>
                    <p className="text-xs text-gray-500 font-sans">{booking.number_of_people} Guests</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 font-sans">GHS {Number(booking.total_cost ?? 0).toFixed(2)}</p>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full font-sans uppercase ${booking.payment_status === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                      {booking.payment_status || "Pending"} {booking.payment_option === "deposit" ? "(Deposit)" : ""}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full font-sans capitalize ${booking.booking_status === "confirmed" ? "bg-blue-50 text-blue-700" : booking.booking_status === "cancelled" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                      {booking.booking_status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/bookings/receipt/${booking.id}`}
                        className="p-1.5 text-gray-400 hover:text-[#0060cc] hover:bg-[#0060cc]/10 rounded-lg"
                        title="Payment receipt (cash / bank / other)"
                      >
                        <Invoice01Icon size={18} />
                      </Link>
                      {booking.booking_status !== "confirmed" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Confirm Booking"
                        >
                          <CheckmarkBadge01Icon size={18} />
                        </button>
                      )}
                      {booking.booking_status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Cancel Booking"
                        >
                          <Cancel01Icon size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Walk-in Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create Walk-in (Invoice) Booking</h2>
              <p className="text-sm text-gray-500 mt-1">Instantly logs the booking and emails the client a Paystack payment link.</p>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="walkin-form" onSubmit={handleSubmitWalkIn} className="space-y-6">
                
                {/* Client Section */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Client Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                      <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                      <input type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm" placeholder="john@example.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                      <div className="phone-input-wrapper">
                      <PhoneInput
                          country="gh"
                          value={customerPhone}
                          onChange={(val: string) => setCustomerPhone(val ? `+${val}` : "")}
                          containerClass="!w-full"
                          inputClass="!w-full !px-4 !py-2 !rounded-lg !border !border-gray-300 focus:!ring-2 focus:!ring-[#ff5e00] !text-sm !bg-white"
                          buttonClass="!bg-white !border !border-gray-300 !rounded-l-lg"
                          enableSearch
                          searchPlaceholder="Search country..."
                        />
                      </div>
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
                        {availableTours.map(t => (
                          <option key={t.id} value={t.title}>{t.title}</option>
                        ))}
                        <option value="custom">-- Create Custom Package --</option>
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
                      <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Time Slot</label>
                      <input type="time" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Number of Guests</label>
                      <input type="number" min="1" required value={numberOfPeople} onChange={(e) => setNumberOfPeople(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Amount Due (GHS) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">GHS</span>
                        <input type="number" step="0.01" min="0" required value={totalCost} onChange={(e) => setTotalCost(e.target.value)} className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] text-sm" placeholder="0.00" />
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
                onClick={() => setIsModalOpen(false)}
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
                    Log Booking & Email Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
