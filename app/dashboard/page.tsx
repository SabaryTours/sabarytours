"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser, logout } from "../lib/authService";
import Link from "next/link";
import { Download06Icon, Calendar04Icon, RefreshIcon, Award05Icon, Logout05Icon } from "hugeicons-react";
import TourLoader from "../components/TourLoader";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [topupLoadingId, setTopupLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handlePayRemaining = async (bookingId: string) => {
    setTopupLoadingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/topup`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get payment link");
      if (data.payment_url) window.location.href = data.payment_url;
      else throw new Error("No payment URL returned");
    } catch (err: any) {
      alert(err.message || "Could not start payment");
    } finally {
      setTopupLoadingId(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        setUser(userData);

        const res = await fetch("/api/dashboard/bookings", { credentials: "include" });
        const userBookings = res.ok ? await res.json() : null;
        if (!res.ok) {
          console.error("Dashboard bookings fetch error:", res.status, await res.text());
        }

        if (userBookings && Array.isArray(userBookings)) {
          const today = new Date().toISOString().split('T')[0];
          const mapped = userBookings.map((b: any) => ({
            id: b.id,
            tour: b.package_name || 'Tour Booking',
            date: b.tour_date || '',
            guests: b.number_of_people || 1,
            status: b.booking_status || 'pending',
            amount: `GHS ${b.total_cost || 0}`,
            amountPaid: b.amount_paid || 0,
            totalCost: b.total_cost || 0,
            paymentStatus: b.payment_status || 'pending',
            paymentOption: b.payment_option || 'full',
            isPast: b.tour_date ? b.tour_date < today : false
          }));
          
          setUpcomingBookings(mapped.filter(b => !b.isPast));
          setPastBookings(mapped.filter(b => b.isPast));
        }
      } catch (err) {
        console.error("Dashboard loadData caught error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <TourLoader />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className="text-[28px] md:text-[36px] text-[#222] uppercase mb-2"
                style={{
                  fontFamily: "var(--font-unlimited-pie)",
                  textShadow: "2px 2px 0px #ddd",
                }}
              >
                Welcome back,{" "}
                <span className="text-[#ff5e00]" style={{ textShadow: "2px 2px 0px #331300" }}>
                  {user?.first_name || "User"}
                </span>
              </h1>
              <p className="text-[#666] text-[14px] font-sans">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-full transition-colors font-sans text-[14px] font-semibold"
            >
              <Logout05Icon size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar04Icon className="text-[#ff5e00]" size={24} />
              <h3 className="text-[#222] font-bold text-[16px] font-sans">Upcoming Tours</h3>
            </div>
            <p className="text-[32px] font-bold text-[#222] font-sans">{upcomingBookings.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Award05Icon className="text-[#ff5e00]" size={24} />
              <h3 className="text-[#222] font-bold text-[16px] font-sans">Sabary Miles</h3>
            </div>
            <p className="text-[32px] font-bold text-[#222] font-sans">{user?.mileage_points || 0}</p>
            <p className="text-[12px] text-[#666] font-sans mt-1">Earn 100 miles per booking</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <RefreshIcon className="text-[#ff5e00]" size={24} />
              <h3 className="text-[#222] font-bold text-[16px] font-sans">Total Bookings</h3>
            </div>
            <p className="text-[32px] font-bold text-[#222] font-sans">
              {upcomingBookings.length + pastBookings.length}
            </p>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2
            className="text-[24px] text-[#222] uppercase mb-6"
            style={{
              fontFamily: "var(--font-unlimited-pie)",
              textShadow: "1px 1px 0px #ddd",
            }}
          >
            Upcoming Bookings
          </h2>

          {upcomingBookings.length === 0 ? (
            <p className="text-[#666] font-sans text-[14px]">No upcoming bookings</p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-[#222] font-bold text-[16px] font-sans mb-1">
                        {booking.tour}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-[#666] text-[14px] font-sans">
                        <span>Date: {booking.date}</span>
                        <span>Guests: {booking.guests}</span>
                        <span
                          className={`font-semibold ${
                            booking.status === "confirmed"
                              ? "text-green-600"
                              : booking.status === "pending"
                              ? "text-yellow-600"
                              : "text-gray-600"
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[#222] font-bold text-[18px] font-sans">
                        {booking.amount}
                      </span>
                      {booking.paymentOption === 'deposit' && booking.totalCost > booking.amountPaid && (
                        <>
                          <span className="text-red-500 text-[12px] font-semibold font-sans">
                            Balance Due: GHS {(booking.totalCost - booking.amountPaid).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePayRemaining(booking.id)}
                            disabled={topupLoadingId === booking.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-sans text-[14px] font-semibold disabled:opacity-70"
                          >
                            {topupLoadingId === booking.id ? "Loading…" : "Pay remaining balance"}
                          </button>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/invoices/${booking.id}`} className="flex items-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-full hover:bg-[#e55500] transition-colors font-sans text-[14px] font-semibold">
                          <Download06Icon size={16} />
                          Receipt
                        </Link>
                        <Link
                          href={`/packages`}
                          className="px-4 py-2 border border-[#ff5e00] text-[#ff5e00] rounded-full hover:bg-[#fff5e6] transition-colors font-sans text-[14px] font-semibold"
                        >
                          Rebook
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2
            className="text-[24px] text-[#222] uppercase mb-6"
            style={{
              fontFamily: "var(--font-unlimited-pie)",
              textShadow: "1px 1px 0px #ddd",
            }}
          >
            Past Bookings
          </h2>

          {pastBookings.length === 0 ? (
            <p className="text-[#666] font-sans text-[14px]">No past bookings</p>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow opacity-75"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-[#222] font-bold text-[16px] font-sans mb-1">
                        {booking.tour}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-[#666] text-[14px] font-sans">
                        <span>Date: {booking.date}</span>
                        <span>Guests: {booking.guests}</span>
                        <span className="font-semibold text-green-600">{booking.status}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#222] font-bold text-[18px] font-sans">
                        {booking.amount}
                      </span>
                      {booking.paymentOption === "deposit" && booking.totalCost > booking.amountPaid && (
                        <button
                          type="button"
                          onClick={() => handlePayRemaining(booking.id)}
                          disabled={topupLoadingId === booking.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 font-sans text-[14px] font-semibold disabled:opacity-70"
                        >
                          {topupLoadingId === booking.id ? "Loading…" : "Pay remaining balance"}
                        </button>
                      )}
                      <Link href={`/dashboard/invoices/${booking.id}`} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#222] rounded-full hover:bg-gray-200 transition-colors font-sans text-[14px] font-semibold">
                        <Download06Icon size={16} />
                        Invoice
                      </Link>
                      <Link
                        href={`/packages/${booking.id}`}
                        className="px-4 py-2 border border-[#ff5e00] text-[#ff5e00] rounded-full hover:bg-[#fff5e6] transition-colors font-sans text-[14px] font-semibold"
                      >
                        Rebook
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

