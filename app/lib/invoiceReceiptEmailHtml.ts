import { buildEmailHtml } from "./emailTemplate";
import { escapeHtml } from "./bookingReceiptEmailHtml";
import type { InvoiceLineItem } from "./parseInvoiceLineItems";

export function formatInvoiceReceiptNumber(invoiceId: string, at: Date = new Date()) {
  const y = at.getFullYear();
  const m = String(at.getMonth() + 1).padStart(2, "0");
  const d = String(at.getDate()).padStart(2, "0");
  return `RCPT-INV-${invoiceId.substring(0, 8).toUpperCase()}-${y}${m}${d}`;
}

export type InvoiceReceiptEmailInput = {
  clientName: string;
  clientEmail: string;
  invoiceReference: string;
  receiptNumber: string;
  issuedDateLabel: string;
  lineItems: InvoiceLineItem[];
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  paymentReference?: string | null;
};

export function buildInvoiceReceiptEmailHtml(p: InvoiceReceiptEmailInput): string {
  const lineRows = p.lineItems
    .map(
      (item) => `
        <tr style="border-top:1px solid #e5e7eb;">
          <td style="padding:14px 0;vertical-align:top;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">${escapeHtml(item.description || "—")}</p>
          </td>
          <td align="right" style="padding:14px 0;font-size:14px;font-weight:700;color:#111827;white-space:nowrap;">${item.amount.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="vertical-align:top;padding-right:20px;width:50%;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Received from</p>
          <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#111827;">${escapeHtml(p.clientName)}</p>
          <p style="margin:0;font-size:13px;color:#6b7280;">${escapeHtml(p.clientEmail)}</p>
        </td>
        <td style="vertical-align:top;padding-left:20px;border-left:3px solid #ff5e00;width:50%;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Payment</p>
          <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Method:</span> <strong style="color:#111827;">${escapeHtml(p.paymentMethod)}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Invoice ref:</span> <strong style="color:#111827;">${escapeHtml(p.invoiceReference)}</strong></p>
          ${p.paymentReference ? `<p style="margin:0;font-size:12px;color:#6b7280;">Transaction ref: ${escapeHtml(p.paymentReference)}</p>` : ""}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border-top:2px solid #111827;margin-bottom:20px;">
      <thead>
        <tr>
          <th align="left" style="padding:10px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Description</th>
          <th align="right" style="padding:10px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Amount (GHS)</th>
        </tr>
      </thead>
      <tbody>${lineRows}</tbody>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-left:auto;width:280px;margin-bottom:28px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Invoice total</td>
        <td align="right" style="padding:4px 0;font-size:13px;color:#6b7280;white-space:nowrap;">GHS ${p.totalAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;font-weight:700;color:#ff5e00;">Amount paid</td>
        <td align="right" style="padding:4px 0;font-size:13px;font-weight:700;color:#ff5e00;white-space:nowrap;">GHS ${p.amountPaid.toFixed(2)}</td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;text-align:center;">
          <p style="margin:0;font-size:14px;font-weight:700;color:#15803d;">&#10003; Payment received — thank you!</p>
        </td>
      </tr>
    </table>
  `;

  return buildEmailHtml({
    documentType: "Payment Receipt",
    metaRows: [
      { label: "Receipt #", value: escapeHtml(p.receiptNumber) },
      { label: "Date", value: escapeHtml(p.issuedDateLabel) },
      { label: "Client", value: escapeHtml(p.clientName) },
      { label: "Invoice", value: escapeHtml(p.invoiceReference) },
    ],
    body,
  });
}
