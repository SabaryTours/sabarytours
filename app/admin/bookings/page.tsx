"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import {
  CheckmarkBadge01Icon,
  Cancel01Icon,
  Invoice01Icon,
  PlusSignIcon,
  Tick02Icon,
} from "hugeicons-react";
import AdminSkeleton from '../components/AdminSkeleton';
import WalkInBookingModal from './WalkInBookingModal';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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

  const handleBookingSuccess = (booking: any) => {
    setBookings((prev) => [booking, ...prev]);
    setIsModalOpen(false);
    setSuccessMsg("Walk-in booking created! The client has been emailed their invoice.");
    setTimeout(() => setSuccessMsg(null), 6000);
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

      {isModalOpen && (
        <WalkInBookingModal
          availableTours={availableTours}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
