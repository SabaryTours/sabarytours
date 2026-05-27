import { buildEmailHtml } from "./emailTemplate";

/** Stable receipt id for print + email (same day as server-issued receipts). */
export function formatBookingReceiptNumber(bookingId: string, at: Date = new Date()) {
  const y = at.getFullYear();
  const m = String(at.getMonth() + 1).padStart(2, "0");
  const d = String(at.getDate()).padStart(2, "0");
  return `RCPT-${bookingId.substring(0, 8).toUpperCase()}-${y}${m}${d}`;
}

/** Escape text for safe insertion into HTML email bodies */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type OfflineReceiptEmailInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  tourName: string;
  tourDate: string;
  timeSlot?: string | null;
  numberOfPeople: number;
  includedActivities?: string | null;
  currency: string;
  totalCost: number;
  amountPreviouslyPaid: number;
  amountReceived: number;
  newAmountPaid: number;
  balanceDue: number;
  paymentMethod: string;
  paymentReference?: string | null;
  receiptNumber: string;
  issuedDateLabel: string;
};

export function buildOfflinePaymentReceiptEmailHtml(p: OfflineReceiptEmailInput): string {
  const paidFull = p.balanceDue <= 0.009;
  const timePart = p.timeSlot ? ` at ${escapeHtml(p.timeSlot)}` : "";

  const body = `
    <!-- ── RECEIVED FROM / BOOKING DETAILS ── -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="vertical-align:top;padding-right:20px;width:50%;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Received from</p>
          <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#111827;">${escapeHtml(p.customerName)}</p>
          <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">${escapeHtml(p.customerEmail)}</p>
          ${p.customerPhone ? `<p style="margin:0;font-size:13px;color:#6b7280;">${escapeHtml(p.customerPhone)}</p>` : ""}
        </td>
        <td style="vertical-align:top;padding-left:20px;border-left:3px solid #ff5e00;width:50%;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Booking details</p>
          <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Tour:</span> <strong style="color:#111827;">${escapeHtml(p.tourName)}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Date:</span> <strong style="color:#111827;">${escapeHtml(p.tourDate)}${timePart}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Guests:</span> <strong style="color:#111827;">${p.numberOfPeople}</strong></p>
          <p style="margin:0;font-size:13px;color:#374151;"><span style="color:#9ca3af;">Method:</span> <strong style="color:#111827;">${escapeHtml(p.paymentMethod)}</strong></p>
          ${p.paymentReference ? `<p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Ref: ${escapeHtml(p.paymentReference)}</p>` : ""}
        </td>
      </tr>
    </table>

    <!-- ── LINE ITEMS TABLE ── -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border-top:2px solid #111827;margin-bottom:20px;">
      <thead>
        <tr>
          <th align="left" style="padding:10px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Description</th>
          <th align="right" style="padding:10px 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Amount (${escapeHtml(p.currency)})</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-top:1px solid #e5e7eb;">
          <td style="padding:14px 0;vertical-align:top;">
            <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#111827;">${escapeHtml(p.tourName)}</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Booking for ${p.numberOfPeople} guest${p.numberOfPeople > 1 ? "s" : ""} &middot; ${escapeHtml(p.tourDate)}${timePart}
            </p>
            ${p.includedActivities ? `<p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">${escapeHtml(p.includedActivities)}</p>` : ""}
          </td>
          <td align="right" style="padding:14px 0;font-size:14px;font-weight:700;color:#111827;vertical-align:top;white-space:nowrap;">
            ${p.totalCost.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ── PAYMENT SUMMARY ── -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-left:auto;width:260px;margin-bottom:28px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Booking total</td>
        <td align="right" style="padding:4px 0;font-size:13px;color:#6b7280;white-space:nowrap;">${escapeHtml(p.currency)} ${p.totalCost.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Previously paid</td>
        <td align="right" style="padding:4px 0;font-size:13px;color:#6b7280;white-space:nowrap;">${escapeHtml(p.currency)} ${p.amountPreviouslyPaid.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;font-weight:700;color:#ff5e00;">This payment (${escapeHtml(p.paymentMethod)})</td>
        <td align="right" style="padding:6px 0;font-size:13px;font-weight:700;color:#ff5e00;white-space:nowrap;">+ ${escapeHtml(p.currency)} ${p.amountReceived.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:2px 0;"><hr style="border:none;border-top:2px solid #111827;margin:4px 0;" /></td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:15px;font-weight:700;color:#111827;">Total paid to date</td>
        <td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:#111827;white-space:nowrap;">${escapeHtml(p.currency)} ${p.newAmountPaid.toFixed(2)}</td>
      </tr>
      ${p.balanceDue > 0.009 ? `
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#dc2626;font-weight:600;">Balance due</td>
        <td align="right" style="padding:4px 0;font-size:13px;color:#dc2626;font-weight:600;white-space:nowrap;">${escapeHtml(p.currency)} ${p.balanceDue.toFixed(2)}</td>
      </tr>` : ""}
    </table>

    <!-- ── STATUS BANNER ── -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:${paidFull ? "#f0fdf4" : "#fff7ed"};border:1px solid ${paidFull ? "#86efac" : "#fed7aa"};border-radius:10px;padding:16px 20px;text-align:center;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${paidFull ? "#15803d" : "#c2410c"};">
            ${paidFull ? "&#10003; Booking paid in full — thank you!" : "&#10003; Payment received — thank you!"}
          </p>
          <p style="margin:0;font-size:12px;color:${paidFull ? "#166534" : "#9a3412"};">
            ${paidFull
              ? "No further payment is required for this booking."
              : `Please arrange the remaining balance of <strong>${escapeHtml(p.currency)} ${p.balanceDue.toFixed(2)}</strong> before your tour date.`
            }
          </p>
        </td>
      </tr>
    </table>
  `;

  return buildEmailHtml({
    documentType: "Payment Receipt",
    metaRows: [
      { label: "Receipt #", value: escapeHtml(p.receiptNumber) },
      { label: "Date issued", value: escapeHtml(p.issuedDateLabel) },
      { label: "Customer", value: escapeHtml(p.customerName) },
      { label: "Payment method", value: escapeHtml(p.paymentMethod) },
      ...(p.paymentReference ? [{ label: "Reference", value: escapeHtml(p.paymentReference) }] : []),
    ],
    body,
  });
}
