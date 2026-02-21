"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { EyeIcon, CheckmarkBadge01Icon, Cancel01Icon } from "hugeicons-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('bookings').update({ booking_status: status }).eq('id', id);
    fetchBookings();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Manage Bookings</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">View and manage customer bookings.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">No bookings found.</td>
                </tr>
              ) : bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 font-sans">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500 font-sans">{booking.customer_email}</p>
                    <p className="text-xs text-gray-500 font-sans">{booking.customer_phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 font-sans line-clamp-1">
                      {booking.tours?.title || 'Unknown Tour'}
                    </p>
                    <p className="text-xs text-gray-500 font-sans">
                      {booking.tour_date} {booking.time_slot ? `at ${booking.time_slot}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 font-sans">{booking.number_of_people} Guests</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 font-sans">${booking.total_cost}</p>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full font-sans uppercase ${
                      booking.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {booking.payment_status || 'Pending'} {booking.payment_option === 'deposit' ? '(Deposit)' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full font-sans capitalize ${
                      booking.booking_status === 'confirmed' ? 'bg-blue-50 text-blue-700' : 
                      booking.booking_status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.booking_status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.booking_status !== 'confirmed' && (
                        <button 
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Confirm Booking"
                        >
                          <CheckmarkBadge01Icon size={18} />
                        </button>
                      )}
                      {booking.booking_status !== 'cancelled' && (
                        <button 
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
}
