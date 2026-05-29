"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import {
  CheckmarkBadge01Icon,
  Cancel01Icon,
  Invoice01Icon,
  PlusSignIcon,
  Tick02Icon,
  Search01Icon,
} from "hugeicons-react";
import AdminSkeleton from '../components/AdminSkeleton';
import WalkInBookingModal from './WalkInBookingModal';

type BookingRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  package_name: string | null;
  tour_date: string | null;
  time_slot: string | null;
  number_of_people: number | null;
  total_cost: number | string | null;
  amount_paid: number | string | null;
  payment_status: string | null;
  payment_option: string | null;
  booking_status: string | null;
  payment_reference: string | null;
  tours?: { title?: string | null } | null;
};

const PAYMENT_STATUSES = ["all", "paid", "pending", "partial"] as const;
const BOOKING_STATUSES = ["all", "confirmed", "pending", "cancelled"] as const;
const PAYMENT_OPTIONS = ["all", "full", "deposit"] as const;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [availableTours, setAvailableTours] = useState<{ id: string; title: string }[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<(typeof PAYMENT_STATUSES)[number]>("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<(typeof BOOKING_STATUSES)[number]>("all");
  const [paymentOptionFilter, setPaymentOptionFilter] = useState<(typeof PAYMENT_OPTIONS)[number]>("all");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('bookings')
      .select('*, tours(title)')
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data as BookingRow[]);

    const { data: toursData } = await supabase.from('tours').select('id, title').eq('status', 'published').order('title');
    if (toursData) setAvailableTours(toursData);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const packageOptions = useMemo(() => {
    const names = new Set<string>();
    for (const b of bookings) {
      const label = b.tours?.title || b.package_name;
      if (label?.trim()) names.add(label.trim());
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const tourLabel = (booking.tours?.title || booking.package_name || "").toLowerCase();
      const name = (booking.customer_name || "").toLowerCase();
      const email = (booking.customer_email || "").toLowerCase();
      const phone = (booking.customer_phone || "").toLowerCase();

      if (q) {
        const matchesSearch =
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          tourLabel.includes(q) ||
          (booking.payment_reference || "").toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (packageFilter !== "all") {
        const label = booking.tours?.title || booking.package_name || "";
        if (label !== packageFilter) return false;
      }

      if (paymentStatusFilter !== "all") {
        const status = (booking.payment_status || "pending").toLowerCase();
        if (status !== paymentStatusFilter) return false;
      }

      if (bookingStatusFilter !== "all") {
        const status = (booking.booking_status || "pending").toLowerCase();
        if (status !== bookingStatusFilter) return false;
      }

      if (paymentOptionFilter !== "all") {
        const option = (booking.payment_option || "full").toLowerCase();
        if (option !== paymentOptionFilter) return false;
      }

      return true;
    });
  }, [bookings, searchQuery, packageFilter, paymentStatusFilter, bookingStatusFilter, paymentOptionFilter]);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('bookings').update({ booking_status: status }).eq('id', id);
    fetchBookings();
  };

  const handleBookingSuccess = (booking: BookingRow) => {
    setBookings((prev) => [booking, ...prev]);
    setIsModalOpen(false);
    setSuccessMsg("Walk-in booking created! The client has been emailed their invoice.");
    setTimeout(() => setSuccessMsg(null), 6000);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPackageFilter("all");
    setPaymentStatusFilter("all");
    setBookingStatusFilter("all");
    setPaymentOptionFilter("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    packageFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    bookingStatusFilter !== "all" ||
    paymentOptionFilter !== "all";

  const renderBookingActions = (booking: BookingRow) => (
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
  );

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

      {/* Search & filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search01Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, tour, or payment reference..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5e00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 font-sans">Package / Tour</label>
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5e00]"
            >
              <option value="all">All packages</option>
              {packageOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 font-sans">Payment status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as (typeof PAYMENT_STATUSES)[number])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5e00]"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 font-sans">Booking status</label>
            <select
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value as (typeof BOOKING_STATUSES)[number])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5e00]"
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 font-sans">Payment type</label>
            <select
              value={paymentOptionFilter}
              onChange={(e) => setPaymentOptionFilter(e.target.value as (typeof PAYMENT_OPTIONS)[number])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff5e00]"
            >
              <option value="all">All</option>
              <option value="full">Full payment</option>
              <option value="deposit">Deposit</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-sans">
          <span className="text-gray-500">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[#ff5e00] font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
              <AdminSkeleton variant="table" rows={2} />
            </div>
          ))
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
            No bookings match your search.
          </div>
        ) : (
          filteredBookings.map((booking) => (
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
                {renderBookingActions(booking)}
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
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">No bookings match your search.</td></tr>
              ) : filteredBookings.map((booking) => (
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
                      {renderBookingActions(booking)}
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
