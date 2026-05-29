"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import Logo from "../../../../components/Logo";
import { ArrowLeft01Icon, Download06Icon, MailSend01Icon } from "hugeicons-react";
import toast from "react-hot-toast";
import { formatInvoiceReceiptNumber } from "../../../../lib/invoiceReceiptEmailHtml";
import { parseInvoiceLineItems } from "../../../../lib/parseInvoiceLineItems";

type InvoiceRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  description: string | null;
  amount: number | null;
  reference: string | null;
  status: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  paid_at?: string | null;
};

const PAYMENT_METHODS = [
  "Cash",
  "Bank transfer",
  "Mobile money (manual)",
  "Paystack (online)",
  "POS / card (manual)",
  "Other",
];

export default function AdminInvoiceReceiptPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [invoice, setInvoice] = useState<InvoiceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [markPaid, setMarkPaid] = useState(true);

  const [lastReceiptNumber, setLastReceiptNumber] = useState<string | null>(null);
  const [issuedLabel, setIssuedLabel] = useState(() =>
    new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  );

  const loadInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase.from("invoices").select("*").eq("id", id).single();
    if (fetchError || !data) {
      setError(fetchError?.message || "Invoice not found");
      setInvoice(null);
    } else {
      const row = data as InvoiceRow;
      setInvoice(row);
      if (row.payment_method) setPaymentMethod(row.payment_method);
      if (row.payment_reference) setPaymentReference(row.payment_reference);
      if (row.paid_at) {
        setIssuedLabel(
          new Date(row.paid_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
      }
      setMarkPaid(row.status !== "paid");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  const lineItems = useMemo(() => {
    if (!invoice) return [];
    return parseInvoiceLineItems(invoice.description, Number(invoice.amount ?? 0));
  }, [invoice]);

  const total = Number(invoice?.amount ?? 0);
  const isPaid = invoice?.status === "paid";

  const receiptNo = lastReceiptNumber || (invoice ? formatInvoiceReceiptNumber(invoice.id) : "—");

  const handlePrint = () => {
    window.requestAnimationFrame(() => window.print());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/invoices/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice.id,
          payment_method: paymentMethod,
          payment_reference: paymentReference.trim() || null,
          send_email: sendEmail,
          mark_paid: markPaid,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue receipt");
      toast.success(data.email_sent ? "Receipt saved and emailed." : "Receipt saved (email not sent).");
      if (data.receipt_number) setLastReceiptNumber(data.receipt_number);
      if (data.invoice) setInvoice(data.invoice as InvoiceRow);
      else await loadInvoice();
      setMarkPaid(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleResendEmail = async () => {
    if (!invoice) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method: paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      toast.success(data.email_sent ? "Receipt emailed to client." : "Email could not be sent.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 font-sans">
        Loading invoice…
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center font-sans">
        <p className="text-red-700 font-medium">{error || "Invoice not found"}</p>
        <Link href="/admin/invoices" className="mt-4 inline-block text-[#ff5e00] font-semibold hover:underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:space-y-0 print:bg-white print:text-black">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <Link
            href={`/admin/invoices/${invoice.id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff5e00] font-sans font-medium mb-2"
          >
            <ArrowLeft01Icon size={18} />
            Invoice
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Payment receipt</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            {isPaid
              ? "Print or resend the receipt for this paid invoice."
              : "Record payment and mark the invoice as paid."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 print:block">
        <div className="min-h-0 print:break-inside-avoid">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 md:p-12 print:shadow-none print:border-none print:w-full print:max-w-none print:p-0 print:mx-0 print:rounded-none">
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start mb-8 sm:mb-12 border-b-[3px] border-[#ff5e00] pb-6 sm:pb-8 print:flex-row print:justify-between">
              <div>
                <Logo />
                <div className="mt-4 text-gray-500 text-sm font-sans space-y-1">
                  <p className="font-semibold text-gray-700">Sabary Travel and Tours</p>
                  <p>Greda Estate, 6th Avenue · Accra, Ghana</p>
                  <p>bookings@sabarytours.com · +233 576 093 838</p>
                </div>
              </div>
              <div className="text-left sm:text-right print:text-right">
                <h1
                  className="text-2xl sm:text-3xl font-normal uppercase text-gray-900 tracking-[0.12em] mb-2"
                  style={{ fontFamily: "var(--font-unlimited-pie)" }}
                >
                  Receipt
                </h1>
                <p className="text-gray-500 font-sans text-sm font-medium break-all">Receipt #: {receiptNo}</p>
                <p className="text-gray-500 font-sans text-sm mt-1">Date: {issuedLabel}</p>
                <p className="text-gray-500 font-sans text-sm mt-1">
                  Invoice ref: <span className="font-semibold text-gray-800">{invoice.reference || "—"}</span>
                </p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200">
                  Paid in full
                </div>
              </div>
            </div>

            <div className="mb-8 sm:mb-10">
              <h3 className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Received from</h3>
              <p className="font-bold text-gray-800 font-sans text-lg">{invoice.client_name || "—"}</p>
              <p className="text-gray-600 font-sans text-sm mt-1 break-all">{invoice.client_email || "—"}</p>
              <p className="text-gray-600 font-sans text-sm mt-3">
                <span className="text-gray-500">Payment method:</span>{" "}
                <span className="font-semibold text-gray-800">{paymentMethod}</span>
              </p>
              {paymentReference.trim() && (
                <p className="text-gray-600 font-sans text-sm mt-1">
                  <span className="text-gray-500">Reference:</span>{" "}
                  <span className="font-semibold text-gray-800">{paymentReference.trim()}</span>
                </p>
              )}
            </div>

            <div className="mb-8 overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-[420px] text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="pb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="pb-3 text-xs font-bold text-gray-700 uppercase tracking-wider text-right">
                      Amount (GHS)
                    </th>
                  </tr>
                </thead>
                <tbody className="font-sans">
                  {lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-4 pr-6 font-semibold text-gray-900">{item.description || "—"}</td>
                      <td className="py-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-10">
              <div className="w-full sm:max-w-xs font-sans">
                <div className="flex justify-between items-center gap-4 text-lg font-bold text-gray-900 border-t-2 border-gray-900 pt-3">
                  <span>Amount paid</span>
                  <span className="whitespace-nowrap text-[#ff5e00]">GHS {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8 text-center text-gray-400 font-sans text-sm">
              <p className="font-medium text-gray-500 mb-1">Thank you for choosing Sabary Travel and Tours!</p>
              <p>Questions? bookings@sabarytours.com · +233 576 093 838</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5e00] text-white rounded-full hover:bg-[#e55500] font-sans font-semibold text-sm w-full justify-center"
          >
            <Download06Icon size={18} />
            Print / Save as PDF
          </button>

          {!isPaid && (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 font-sans"
            >
              <h2 className="font-bold text-gray-800 text-sm">Record payment</h2>
              <label className="block text-xs text-gray-500">
                Payment method
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-gray-500">
                Payment reference (optional)
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Transaction ID, bank ref, etc."
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={markPaid} onChange={(e) => setMarkPaid(e.target.checked)} />
                Mark invoice as paid
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                Email receipt to client
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-gray-900 text-white rounded-full font-semibold text-sm hover:bg-gray-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save & issue receipt"}
              </button>
            </form>
          )}

          {isPaid && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 font-sans">
              <p className="text-sm text-gray-600">This invoice is marked as paid.</p>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                <MailSend01Icon size={16} />
                Resend receipt email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
