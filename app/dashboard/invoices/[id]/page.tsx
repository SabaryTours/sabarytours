"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { getUser } from "../../../lib/authService";
import Logo from "../../../components/Logo";
import { Download06Icon, ArrowLeft01Icon } from "hugeicons-react";
import TourLoader from "../../../components/TourLoader";
import Link from "next/link";

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const user = await getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            tours (title)
          `)
          .eq("id", id)
          .eq("user_id", user.id) // Security check to ensure it belongs to the user
          .single();

        if (error) throw error;
        if (!data) throw new Error("Booking not found");

        setBooking(data);
      } catch (err: any) {
        console.error("Error fetching invoice:", err);
        setError(err.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <TourLoader />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 font-sans overflow-hidden">Invoice Error</h1>
        <p className="text-gray-600 mb-6 font-sans">{error || "Invoice not found."}</p>
        <Link href="/dashboard" className="px-6 py-2 bg-[#ff5e00] text-white rounded-full hover:bg-[#e55500] font-sans transition-colors font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 print:py-0 print:px-0 print:bg-white overflow-hidden">
      
      {/* Non-printable controls */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-[#ff5e00] transition-colors font-sans font-medium text-sm">
          <ArrowLeft01Icon size={18} />
          Back to Dashboard
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5e00] text-white rounded-full hover:bg-[#e55500] shadow-sm transition-colors font-sans font-semibold text-sm"
        >
          <Download06Icon size={18} />
          Download PDF / Print
        </button>
      </div>

      {/* Printable Area - A4 Paper Ratio approximately */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 print:shadow-none print:border-none print:w-full print:max-w-none print:p-0">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
          <div>
            <Logo />
            <div className="mt-4 text-gray-500 text-sm font-sans space-y-1">
              <p>Sabary Travel and Tours</p>
              <p>Greda Estate, 6th Avenue</p>
              <p>Accra, Ghana</p>
              <p>bookings@sabarytours.com</p>
              <p>+233 576 093 838</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold uppercase text-gray-800 tracking-wider mb-2" style={{ fontFamily: "var(--font-unlimited-pie)" }}>Invoice</h1>
            <p className="text-gray-500 font-sans text-sm font-medium">Receipt #: INV-{booking.id.substring(0, 8).toUpperCase()}</p>
            <p className="text-gray-500 font-sans text-sm mt-1">Date Issued: {new Date().toLocaleDateString()}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold uppercase tracking-wider">
              {booking.payment_status === "paid" ? "PAID IN FULL" : booking.payment_status === "deposit" ? "DEPOSIT PAID" : "PENDING"}
            </div>
          </div>
        </div>

        {/* Billed To Section */}
        <div className="mb-10 flex gap-12">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-gray-800 font-sans text-lg">{booking.first_name} {booking.last_name}</p>
            <p className="text-gray-600 font-sans text-sm mt-1">{booking.email}</p>
            <p className="text-gray-600 font-sans text-sm mt-0.5">{booking.phone}</p>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Booking Details</h3>
            <div className="text-sm font-sans space-y-1.5 border-l-2 border-[#ff5e00] pl-4">
              <p><span className="text-gray-500">Tour Date:</span> <span className="font-semibold text-gray-800">{new Date(booking.booking_date).toLocaleDateString()}</span></p>
              <p><span className="text-gray-500">Guests:</span> <span className="font-semibold text-gray-800">{booking.number_of_people}</span></p>
              <p><span className="text-gray-500">Status:</span> <span className="font-semibold text-gray-800">{booking.status}</span></p>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-3 text-sm font-bold text-gray-800 font-sans uppercase tracking-wider">Description</th>
                <th className="py-3 text-sm font-bold text-gray-800 font-sans uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="font-sans">
              <tr className="border-b border-gray-100">
                <td className="py-5 text-gray-800">
                  <span className="font-bold text-base block mb-1">{booking.tours?.title || 'Custom Tour Booking'}</span>
                  <span className="text-sm text-gray-500">Booking for {booking.number_of_people} people</span>
                </td>
                <td className="py-5 text-gray-800 text-right font-semibold">
                  {booking.currency} {booking.total_price.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3 font-sans">
            <div className="flex justify-between items-center text-gray-600 text-sm">
              <span>Subtotal</span>
              <span>{booking.currency} {booking.total_price.toFixed(2)}</span>
            </div>
            {/* You can add tax/discount rows here later if needed */}
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total</span>
              <span>{booking.currency} {booking.total_price.toFixed(2)}</span>
            </div>
            {booking.payment_status === "deposit" && (
              <div className="flex justify-between items-center text-sm font-bold text-[#ff5e00] pt-1">
                <span>Amount Paid (Deposit)</span>
                <span>{booking.currency} {(booking.total_price * 0.3).toFixed(2)}</span>
              </div>
            )}
             {booking.payment_status === "deposit" && (
              <div className="flex justify-between items-center text-sm font-bold text-gray-500 pt-1">
                <span>Balance Due</span>
                <span>{booking.currency} {(booking.total_price * 0.7).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-100 pt-8 mt-12 text-center text-gray-400 font-sans text-sm">
          <p className="mb-1 font-medium text-gray-500">Thank you for traveling with us!</p>
          <p>For any questions regarding this invoice, please contact bookings@sabarytours.com</p>
        </div>
      </div>

    </div>
  );
}
