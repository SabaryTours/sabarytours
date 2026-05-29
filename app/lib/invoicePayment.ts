import type { SupabaseClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "./resend";
import {
  buildInvoiceReceiptEmailHtml,
  formatInvoiceReceiptNumber,
} from "./invoiceReceiptEmailHtml";
import { parseInvoiceLineItems } from "./parseInvoiceLineItems";

export type InvoiceRow = {
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

export type MarkInvoicePaidResult =
  | { ok: true; invoice: InvoiceRow; alreadyPaid: boolean }
  | { ok: false; reason: "not_found" | "amount_mismatch" | "update_failed"; message?: string };

function expectedPesewas(amountGhs: number): number {
  return Math.round(Number(amountGhs) * 100);
}

export async function sendInvoiceReceiptEmail(
  invoice: InvoiceRow,
  opts: {
    paymentMethod: string;
    paymentReference?: string | null;
    amountPaid?: number;
    receiptNumber?: string;
    issuedAt?: Date;
  }
): Promise<{ receiptNumber: string; emailSent: boolean }> {
  const issued = opts.issuedAt ?? new Date();
  const receiptNumber = opts.receiptNumber ?? formatInvoiceReceiptNumber(invoice.id, issued);
  const issuedDateLabel = issued.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const total = Number(invoice.amount ?? 0);
  const lineItems = parseInvoiceLineItems(invoice.description, total);
  const amountPaid = opts.amountPaid ?? total;

  let emailSent = false;
  if (resend && invoice.client_email) {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [invoice.client_email],
      subject: `Payment Receipt — ${invoice.reference || "Invoice"}`,
      html: buildInvoiceReceiptEmailHtml({
        clientName: invoice.client_name || "Client",
        clientEmail: invoice.client_email,
        invoiceReference: invoice.reference || "—",
        receiptNumber,
        issuedDateLabel,
        lineItems,
        totalAmount: total,
        amountPaid,
        paymentMethod: opts.paymentMethod,
        paymentReference: opts.paymentReference ?? invoice.reference,
      }),
    });
    if (error) {
      console.error("[Invoice] Receipt email failed:", error);
    } else {
      emailSent = true;
    }
  }

  return { receiptNumber, emailSent };
}

async function updateInvoicePaid(
  supabaseAdmin: SupabaseClient,
  invoiceId: string,
  extras: {
    payment_method?: string;
    payment_reference?: string;
    paid_at?: string;
  }
): Promise<{ error: { message: string } | null }> {
  const payload: Record<string, unknown> = {
    status: "paid",
    ...extras,
  };
  let result = await supabaseAdmin.from("invoices").update(payload).eq("id", invoiceId);
  if (result.error && /column/i.test(result.error.message)) {
    result = await supabaseAdmin.from("invoices").update({ status: "paid" }).eq("id", invoiceId);
  }
  return { error: result.error };
}

/** Mark a standalone invoice paid (Paystack or manual). */
export async function markInvoiceAsPaid(
  supabaseAdmin: SupabaseClient,
  invoiceId: string,
  options: {
    paymentMethod: string;
    paymentReference?: string | null;
    amountPesewas?: number;
    sendReceiptEmail?: boolean;
  }
): Promise<MarkInvoicePaidResult> {
  const { data: invoice, error: fetchErr } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (fetchErr || !invoice) {
    return { ok: false, reason: "not_found" };
  }

  const row = invoice as InvoiceRow;
  if (row.status === "paid") {
    if (options.sendReceiptEmail) {
      await sendInvoiceReceiptEmail(row, {
        paymentMethod: options.paymentMethod,
        paymentReference: options.paymentReference,
      });
    }
    return { ok: true, invoice: row, alreadyPaid: true };
  }

  if (options.amountPesewas != null) {
    const expected = expectedPesewas(Number(row.amount ?? 0));
    if (options.amountPesewas !== expected) {
      return { ok: false, reason: "amount_mismatch" };
    }
  }

  const paidAt = new Date().toISOString();
  const { error: upErr } = await updateInvoicePaid(supabaseAdmin, invoiceId, {
    payment_method: options.paymentMethod,
    payment_reference: options.paymentReference ?? undefined,
    paid_at: paidAt,
  });

  if (upErr) {
    return { ok: false, reason: "update_failed", message: upErr.message };
  }

  const { data: updated } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  const finalRow = (updated ?? { ...row, status: "paid" }) as InvoiceRow;

  if (options.sendReceiptEmail) {
    await sendInvoiceReceiptEmail(finalRow, {
      paymentMethod: options.paymentMethod,
      paymentReference: options.paymentReference,
    });
  }

  return { ok: true, invoice: finalRow, alreadyPaid: false };
}

/** Resolve invoice by Paystack reference and mark paid if amount matches. */
export async function markInvoicePaidByReference(
  supabaseAdmin: SupabaseClient,
  reference: string,
  amountPesewas: number,
  options?: { sendReceiptEmail?: boolean }
): Promise<MarkInvoicePaidResult | { ok: false; reason: "not_found" }> {
  const { data: invoice } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (!invoice) {
    return { ok: false, reason: "not_found" };
  }

  return markInvoiceAsPaid(supabaseAdmin, invoice.id, {
    paymentMethod: "Paystack (online)",
    paymentReference: reference,
    amountPesewas,
    sendReceiptEmail: options?.sendReceiptEmail ?? true,
  });
}
