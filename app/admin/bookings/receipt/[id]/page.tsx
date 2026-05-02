"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import Logo from "../../../../components/Logo";
import { ArrowLeft01Icon, Download06Icon, MailSend01Icon } from "hugeicons-react";
import toast from "react-hot-toast";
import { formatBookingReceiptNumber } from "../../../../lib/bookingReceiptEmailHtml";

type BookingRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  package_name: string | null;
  tour_date: string | null;
  time_slot: string | null;
  number_of_people: number | null;
  total_cost: number | null;
  amount_paid: number | null;
  payment_status: string | null;
  payment_reference: string | null;
  currency?: string | null;
  tours?: { title?: string } | null;
};

const PAYMENT_METHODS = ["Cash", "Bank transfer", "Mobile money (manual)", "POS / card (manual)", "Other"];

export default function AdminBookingReceiptPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [updateBooking, setUpdateBooking] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  const [lastReceiptNumber, setLastReceiptNumber] = useState<string | null>(null);
  const [issuedLabel, setIssuedLabel] = useState(() => new Date().toLocaleDateString());

  const loadBooking = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("bookings")
      .select("*, tours(title)")
      .eq("id", id)
      .single();
    if (fetchError || !data) {
      setError(fetchError?.message || "Booking not found");
      setBooking(null);
    } else {
      setBooking(data as BookingRow);
      const total = Number((data as BookingRow).total_cost ?? 0);
      const paid = Number((data as BookingRow).amount_paid ?? 0);
      const bal = Math.max(total - paid, 0);
      setAmountReceived(bal > 0 ? bal.toFixed(2) : total.toFixed(2));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const currency = booking?.currency || "GHS";
  const tourTitle = booking?.tours?.title || booking?.package_name || "Tour booking";

  const preview = useMemo(() => {
    if (!booking) return null;
    const total = Number(booking.total_cost ?? 0);
    const prevPaid = Number(booking.amount_paid ?? 0);
    const recv = Math.max(Number(amountReceived) || 0, 0);
    const applied = updateBooking ? Math.min(recv, Math.max(total - prevPaid, 0)) : recv;
    const newPaid = updateBooking ? prevPaid + applied : prevPaid;
    const bal = Math.max(total - newPaid, 0);
    const receiptNo = lastReceiptNumber || formatBookingReceiptNumber(booking.id, new Date());
    return {
      total,
      prevPaid,
      applied: updateBooking ? applied : recv,
      newPaid,
      bal,
      receiptNo,
      fullyPaid: bal <= 0.009,
    };
  }, [booking, amountReceived, updateBooking, lastReceiptNumber]);

  const handlePrint = () => {
    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bookings/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          payment_method: paymentMethod,
          payment_reference: paymentReference.trim() || null,
          amount_received: Number(amountReceived),
          update_booking_payment: updateBooking,
          send_email: sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue receipt");
      if (data.amount_capped) {
        toast.success("Receipt sent. Amount was capped to the remaining balance.");
      } else {
        toast.success(data.email_sent ? "Receipt saved and emailed." : "Receipt saved (email not sent).");
      }
      setLastReceiptNumber(data.receipt_number);
      setIssuedLabel(new Date().toLocaleDateString());
      if (data.booking) setBooking(data.booking as BookingRow);
      else await loadBooking();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 font-sans">
        Loading booking…
      </div>
    );
  }

  if (error || !booking || !preview) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center font-sans">
        <p className="text-red-700 font-medium">{error || "Not found"}</p>
        <Link href="/admin/bookings" className="mt-4 inline-block text-[#ff5e00] font-semibold hover:underline">
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff5e00] font-sans font-medium mb-2"
          >
            <ArrowLeft01Icon size={18} />
            Bookings
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Payment receipt</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            Record cash, bank, or other non-Paystack payments and email the client a receipt (same style as invoices).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 print:block">
        <div className="min-h-0 print:break-inside-avoid">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 print:shadow-none print:border-none print:w-full print:max-w-none print:p-0 print:mx-0">
            <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8 print:mb-8 print:pb-6">
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
                <h1
                  className="text-3xl font-bold uppercase text-gray-800 tracking-wider mb-2"
                  style={{ fontFamily: "var(--font-unlimited-pie)" }}
                >
                  Payment receipt
                </h1>
                <p className="text-gray-500 font-sans text-sm font-medium">Receipt #: {preview.receiptNo}</p>
                <p className="text-gray-500 font-sans text-sm mt-1">Date issued: {issuedLabel}</p>
                <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200">
                  {preview.fullyPaid ? "Paid in full" : "Payment received"}
                </div>
              </div>
            </div>

            <div className="mb-10 flex flex-col sm:flex-row gap-10 sm:gap-12">
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Received from</h3>
                <p className="font-bold text-gray-800 font-sans text-lg">{booking.customer_name || "—"}</p>
                <p className="text-gray-600 font-sans text-sm mt-1">{booking.customer_email || "—"}</p>
                {booking.customer_phone && (
                  <p className="text-gray-600 font-sans text-sm mt-0.5">{booking.customer_phone}</p>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Booking details</h3>
                <div className="text-sm font-sans space-y-1.5 border-l-2 border-[#ff5e00] pl-4">
                  <p>
                    <span className="text-gray-500">Tour date:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {booking.tour_date
                        ? new Date(
                            booking.tour_date.length <= 10 ? `${booking.tour_date}T12:00:00` : booking.tour_date
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </p>
                  {booking.time_slot && (
                    <p>
                      <span className="text-gray-500">Time:</span>{" "}
                      <span className="font-semibold text-gray-800">{booking.time_slot}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-gray-500">Guests:</span>{" "}
                    <span className="font-semibold text-gray-800">{booking.number_of_people ?? "—"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Payment method:</span>{" "}
                    <span className="font-semibold text-gray-800">{paymentMethod}</span>
                  </p>
                  {paymentReference.trim() && (
                    <p>
                      <span className="text-gray-500">Reference:</span>{" "}
                      <span className="font-semibold text-gray-800">{paymentReference.trim()}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-10 print:break-inside-avoid">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="py-3 text-sm font-bold text-gray-800 font-sans uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-3 text-sm font-bold text-gray-800 font-sans uppercase tracking-wider text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="font-sans">
                  <tr className="border-b border-gray-100">
                    <td className="py-5 text-gray-800">
                      <span className="font-bold text-base block mb-1">{tourTitle}</span>
                      <span className="text-sm text-gray-500">
                        Booking for {booking.number_of_people ?? 1}{" "}
                        {(booking.number_of_people ?? 1) > 1 ? "people" : "person"}
                      </span>
                    </td>
                    <td className="py-5 text-gray-800 text-right font-semibold">
                      {currency} {preview.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-12 print:break-inside-avoid">
              <div className="w-full max-w-xs space-y-3 font-sans">
                <div className="flex justify-between items-center text-gray-600 text-sm">
                  <span>Booking total</span>
                  <span>
                    {currency} {preview.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600 text-sm">
                  <span>Previously paid</span>
                  <span>
                    {currency} {preview.prevPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#ff5e00] pt-1">
                  <span>This payment ({paymentMethod})</span>
                  <span>
                    {currency} {preview.applied.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Total paid to date</span>
                  <span>
                    {currency} {preview.newPaid.toFixed(2)}
                  </span>
                </div>
                {preview.bal > 0.009 && (
                  <div className="flex justify-between items-center text-sm font-bold text-gray-500 pt-1">
                    <span>Balance due</span>
                    <span>
                      {currency} {preview.bal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-2 border-gray-100 pt-8 text-center text-gray-400 font-sans text-sm print:pt-6">
              <p className="mb-1 font-medium text-gray-500">Thank you for traveling with us!</p>
              <p>For questions, contact bookings@sabarytours.com</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 print:hidden">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5e00] text-white rounded-full hover:bg-[#e55500] shadow-sm transition-colors font-sans font-semibold text-sm"
            >
              <Download06Icon size={18} />
              Print / Save as PDF
            </button>
          </div>
          <p className="text-xs text-gray-500 font-sans leading-relaxed">
            Use your browser&apos;s print dialog and choose &quot;Save as PDF&quot; for a clean file. Margins are set
            for A4.
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 font-sans">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Issue receipt</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reference (optional)</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                placeholder="Bank ref, MoMo ID, etc."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount received ({currency})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={updateBooking}
                onChange={(e) => setUpdateBooking(e.target.checked)}
                className="rounded border-gray-300"
              />
              Update booking payment in database
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-gray-300"
              />
              Email receipt to client
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0060cc] text-white rounded-lg font-semibold text-sm hover:bg-[#004a9e] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <MailSend01Icon size={18} />
                  Save &amp; send receipt
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
