"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser, logout } from "../lib/authService";
import Link from "next/link";
import { Download06Icon, Calendar04Icon, RefreshIcon, Award05Icon, Logout05Icon } from "hugeicons-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData);
    } else {
      // In mock mode, use demo user data for UI preview
      setUser({
        id: "1",
        email: "demo@sabarytours.com",
        firstName: "John",
        lastName: "Doe",
      });
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#222] font-sans">Loading...</p>
      </div>
    );
  }

  // Mock booking data - replace with actual API calls
  const upcomingBookings = [
    {
      id: 1,
      tour: "Cape Coast & Elmina Castle Tour",
      date: "2024-03-15",
      guests: 2,
      status: "Confirmed",
      amount: "$450",
    },
    {
      id: 2,
      tour: "Kakum National Park Adventure",
      date: "2024-04-20",
      guests: 4,
      status: "Pending",
      amount: "$680",
    },
  ];

  const pastBookings = [
    {
      id: 3,
      tour: "Accra City Tour",
      date: "2024-01-10",
      guests: 2,
      status: "Completed",
      amount: "$250",
    },
  ];

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
                  {user?.firstName || "User"}
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
            <p className="text-[32px] font-bold text-[#222] font-sans">1,250</p>
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
                            booking.status === "Confirmed"
                              ? "text-green-600"
                              : booking.status === "Pending"
                              ? "text-yellow-600"
                              : "text-gray-600"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#222] font-bold text-[18px] font-sans">
                        {booking.amount}
                      </span>
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#ff5e00] text-white rounded-full hover:bg-[#e55500] transition-colors font-sans text-[14px] font-semibold">
                        <Download06Icon size={16} />
                        Receipt
                      </button>
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
                    <div className="flex items-center gap-4">
                      <span className="text-[#222] font-bold text-[18px] font-sans">
                        {booking.amount}
                      </span>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#222] rounded-full hover:bg-gray-200 transition-colors font-sans text-[14px] font-semibold">
                        <Download06Icon size={16} />
                        Invoice
                      </button>
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

