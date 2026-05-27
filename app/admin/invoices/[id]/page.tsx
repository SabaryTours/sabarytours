"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import Logo from "../../../components/Logo";
import { ArrowLeft01Icon, Download06Icon, Link01Icon } from "hugeicons-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LineItem = { description: string; amount: number };

type InvoiceRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  description: string | null;
  amount: number | null;
  payment_url: string | null;
  reference: string | null;
  status: "pending" | "paid" | "cancelled" | null;
  created_at: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse the DB description field — may be a JSON array (new) or plain text (legacy). */
function parseLineItems(description: string | null, totalAmount: number): LineItem[] {
  if (!description) return [{ description: "Invoice", amount: totalAmount }];
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: Record<string, unknown>) => ({
        description: String(item.description || ""),
        amount: parseFloat(String(item.amount)) || 0,
      }));
    }
  } catch {
    // plain text — treat as a single line item
  }
  return [{ description, amount: totalAmount }];
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const [invoice, setInvoice] = useState<InvoiceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError || !data) {
      setError(fetchError?.message || "Invoice not found");
    } else {
      setInvoice(data as InvoiceRow);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  const handlePrint = () => {
    window.requestAnimationFrame(() => window.print());
  };

  const handleCopyLink = () => {
    if (!invoice?.payment_url) return;
    navigator.clipboard.writeText(invoice.payment_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Loading / error states ──────────────────────────────────────────────────

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
        <Link
          href="/admin/invoices"
          className="mt-4 inline-block text-[#ff5e00] font-semibold hover:underline"
        >
          ← Back to invoices
        </Link>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const total = Number(invoice.amount ?? 0);
  const lineItems = parseLineItems(invoice.description, total);
  const lineTotal = lineItems.reduce((s, i) => s + i.amount, 0);

  const issuedDate = invoice.created_at
    ? new Date(invoice.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString();

  const reference = invoice.reference || "—";
  const status = (invoice.status || "pending") as keyof typeof STATUS_STYLES;
  const statusClass = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 print:space-y-0 print:bg-white print:text-black">
      {/* ── Top nav bar (hidden when printing) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff5e00] font-sans font-medium mb-2 transition-colors"
          >
            <ArrowLeft01Icon size={18} />
            Invoices
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Invoice</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            Print or save this invoice as a PDF to share with the client.
          </p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 print:block">

        {/* ══ LEFT: printable invoice document ══ */}
        <div className="min-h-0 print:break-inside-avoid">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200
                          p-4 sm:p-8 md:p-12
                          print:shadow-none print:border-none print:w-full print:max-w-none
                          print:p-0 print:mx-0 print:rounded-none">

            {/* Header row: logo+address  |  INVOICE title+meta */}
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start
                            mb-8 sm:mb-12 border-b-[3px] border-[#ff5e00] pb-6 sm:pb-8
                            print:flex-row print:justify-between print:items-start print:mb-10 print:pb-8">
              {/* Left: logo + address */}
              <div>
                <Logo />
                <div className="mt-4 text-gray-500 text-sm font-sans space-y-0.5 leading-relaxed">
                  <p className="font-semibold text-gray-700">Sabary Travel and Tours</p>
                  <p>Greda Estate, 6th Avenue</p>
                  <p>Accra, Ghana</p>
                  <p>bookings@sabarytours.com</p>
                  <p>+233 576 093 838</p>
                </div>
              </div>

              {/* Right: document meta */}
              <div className="text-left sm:text-right print:text-right">
                <h1
                  className="text-2xl sm:text-4xl font-normal uppercase text-gray-900
                             tracking-[0.15em] mb-3 leading-tight"
                  style={{ fontFamily: "var(--font-unlimited-pie)" }}
                >
                  Invoice
                </h1>
                <div className="space-y-1 text-sm font-sans">
                  <p>
                    <span className="text-gray-400">Invoice&nbsp;#:&nbsp;</span>
                    <span className="font-semibold text-gray-800 break-all">{reference}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Date:&nbsp;</span>
                    <span className="font-semibold text-gray-800">{issuedDate}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Due:&nbsp;</span>
                    <span className="font-semibold text-gray-800">Upon receipt</span>
                  </p>
                </div>
                <div
                  className={`mt-3 inline-block px-3 py-1 rounded-full text-[10px] font-bold
                              uppercase tracking-wider border ${statusClass}`}
                >
                  {status}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8 sm:mb-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] font-sans mb-2">
                Bill To
              </p>
              <p className="font-bold text-gray-900 font-sans text-lg leading-tight">
                {invoice.client_name || "—"}
              </p>
              <p className="text-gray-500 font-sans text-sm mt-1 break-all sm:break-normal print:break-normal">
                {invoice.client_email || "—"}
              </p>
            </div>

            {/* Line items table */}
            <div className="mb-8 sm:mb-10 print:break-inside-avoid overflow-x-auto print:overflow-visible">
              <table className="w-full text-left border-collapse" style={{ minWidth: "420px" }}>
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="pb-3 text-xs font-bold text-gray-700 font-sans uppercase tracking-wider">
                      Description
                    </th>
                    <th className="pb-3 text-xs font-bold text-gray-700 font-sans uppercase tracking-wider text-right">
                      Amount&nbsp;(GHS)
                    </th>
                  </tr>
                </thead>
                <tbody className="font-sans">
                  {lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-4 pr-6 align-top">
                        <span className="font-semibold text-gray-900 text-[15px]">
                          {item.description || "—"}
                        </span>
                      </td>
                      <td className="py-4 align-top text-right font-semibold text-gray-900 whitespace-nowrap text-[15px]">
                        {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total block */}
            <div className="flex justify-end mb-10 print:break-inside-avoid">
              <div className="w-full sm:max-w-xs font-sans space-y-2">
                {lineItems.length > 1 && (
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Subtotal</span>
                    <span className="whitespace-nowrap">GHS {lineTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-4 text-lg font-bold text-gray-900
                                border-t-2 border-gray-900 pt-3">
                  <span>Total Due</span>
                  <span className="whitespace-nowrap text-[#ff5e00]">GHS {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment options */}
            <div className="border-t border-gray-200 pt-8 print:break-inside-avoid">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] font-sans mb-5">
                Payment Options
              </p>

              {/* Paystack link — shown as text for print, as button on screen */}
              {invoice.payment_url && (
                <div className="mb-6">
                  <a
                    href={invoice.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#ff5e00] text-white px-7 py-3 rounded-full
                               font-bold text-sm font-sans hover:bg-[#e55500] transition-colors
                               print:hidden"
                  >
                    Pay Online via Paystack →
                  </a>
                  {/* Print-only fallback */}
                  <p className="hidden print:block text-sm font-sans text-gray-700">
                    <span className="font-bold">Pay online:&nbsp;</span>
                    <span className="text-[#0060cc] break-all">{invoice.payment_url}</span>
                  </p>
                </div>
              )}

              {/* Manual payment options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-sm">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                    MTN Mobile Money
                  </p>
                  <p className="font-bold text-gray-900 text-base">0598952236</p>
                  <p className="text-xs text-gray-500 mt-0.5">Sabary Travel and Tour</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">
                    Airtel Tigo
                  </p>
                  <p className="font-bold text-gray-900 text-base">0576093838</p>
                  <p className="text-xs text-gray-500 mt-0.5">Sabary Travel and Tour</p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                    GT Bank
                  </p>
                  <p className="font-bold text-gray-900 text-base">206115998220</p>
                  <p className="text-xs text-gray-500 mt-0.5">Sabary Travel and Tour</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 border-t border-gray-100 pt-8 text-center text-gray-400 font-sans text-sm print:pt-6">
              <p className="font-medium text-gray-500 mb-1">
                Thank you for choosing Sabary Travel and Tours!
              </p>
              <p>Questions? Contact bookings@sabarytours.com · +233 576 093 838</p>
            </div>
          </div>
        </div>

        {/* ══ RIGHT: actions sidebar (hidden when printing) ══ */}
        <div className="space-y-4 print:hidden">

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5e00] text-white rounded-full
                       hover:bg-[#e55500] shadow-sm transition-colors font-sans font-semibold text-sm"
          >
            <Download06Icon size={18} />
            Print / Save as PDF
          </button>
          <p className="text-xs text-gray-500 font-sans leading-relaxed">
            Use your browser&apos;s print dialog and choose &quot;Save as PDF&quot; for a clean
            shareable file. Margins are set for A4.
          </p>

          {/* Invoice summary card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 font-sans">
            <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
              Invoice Summary
            </h2>
            <div className="space-y-2.5 text-sm divide-y divide-gray-100">
              <div className="flex justify-between pt-1 first:pt-0">
                <span className="text-gray-500">Reference</span>
                <span className="font-semibold text-gray-800 break-all text-right ml-2 max-w-35">
                  {reference}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500">Client</span>
                <span className="font-semibold text-gray-800 text-right ml-2 truncate max-w-35">
                  {invoice.client_name}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-[#ff5e00]">GHS {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500">Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusClass}`}
                >
                  {status}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500">Line items</span>
                <span className="font-semibold text-gray-800">{lineItems.length}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-500">Issued</span>
                <span className="font-semibold text-gray-800">{issuedDate}</span>
              </div>
            </div>
          </div>

          {/* Copy Paystack link */}
          {invoice.payment_url && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 font-sans space-y-2">
              <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                Paystack Link
              </h2>
              <p className="text-xs text-gray-500 break-all font-mono leading-relaxed">
                {invoice.payment_url}
              </p>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-bold text-[#ff5e00]
                           hover:text-[#e55500] transition-colors"
              >
                <Link01Icon size={13} />
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
