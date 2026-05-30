import { buildEmailHtml } from "./emailTemplate";

export type BookingConfirmationEmailInput = {
  customerName: string;
  customerEmail: string;
  tourName: string;
  tourDate: string;
  timeSlot?: string | null;
  numberOfPeople: number;
  pickupLocation?: string | null;
  paymentReference: string;
  paymentOption: "full" | "deposit" | "cash";
  amountPaid: number;
  totalCost: number;
  currency: string;
  bookingId: string;
};

export function buildBookingConfirmationEmailHtml(p: BookingConfirmationEmailInput): string {
  const timePart = p.timeSlot ? ` at ${escapeHtml(p.timeSlot)}` : "";
  const balanceDue = Math.max(p.totalCost - p.amountPaid, 0);
  const isDeposit = p.paymentOption === "deposit" && balanceDue > 0.009;
  const isCash = p.paymentOption === "cash";

  const body = `
    <!-- ── GREETING ── -->
    <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
      Hi <strong style="color:#111827;">${escapeHtml(p.customerName.split(" ")[0])}</strong>, your booking ${isCash ? "has been received" : "is confirmed"}!
      We&rsquo;re excited to host you. Here are your booking details.
    </p>

    <!-- ── BOOKING DETAILS ── -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:28px;">
      <tr>
        <td style="padding:24px 28px;">
          <p style="margin:0 0 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Tour details</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#6b7280;width:38%;vertical-align:top;">Tour</td>
              <td style="padding:5px 0;font-size:13px;font-weight:700;color:#111827;vertical-align:top;">${escapeHtml(p.tourName)}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#6b7280;vertical-align:top;">Date &amp; time</td>
              <td style="padding:5px 0;font-size:13px;font-weight:700;color:#111827;vertical-align:top;">${escapeHtml(p.tourDate)}${timePart}</td>
            </tr>
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#6b7280;vertical-align:top;">Guests</td>
              <td style="padding:5px 0;font-size:13px;font-weight:700;color:#111827;vertical-align:top;">${p.numberOfPeople} guest${p.numberOfPeople > 1 ? "s" : ""}</td>
            </tr>
            ${p.pickupLocation ? `
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#6b7280;vertical-align:top;">Pick-up</td>
              <td style="padding:5px 0;font-size:13px;font-weight:700;color:#111827;vertical-align:top;">${escapeHtml(p.pickupLocation)}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:5px 0;font-size:13px;color:#6b7280;vertical-align:top;">Reference</td>
              <td style="padding:5px 0;font-size:13px;font-weight:700;color:#111827;vertical-align:top;">${escapeHtml(p.paymentReference)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- ── PAYMENT SUMMARY ── -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-left:auto;width:280px;margin-bottom:28px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#6b7280;">Booking total</td>
        <td align="right" style="padding:4px 0;font-size:13px;color:#6b7280;white-space:nowrap;">${escapeHtml(p.currency)} ${p.totalCost.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;font-weight:700;color:#ff5e00;">${isCash ? "Amount paid now" : "Amount paid"}</td>
        <td align="right" style="padding:4px 0;font-size:13px;font-weight:700;color:#ff5e00;white-space:nowrap;">${escapeHtml(p.currency)} ${p.amountPaid.toFixed(2)}</td>
      </tr>
      ${(isDeposit || isCash) ? `
      <tr>
        <td colspan="2" style="padding:2px 0;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:4px 0;" /></td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#dc2626;font-weight:600;">${isCash ? "Due in person" : "Balance due"}</td>
        <td align="right" style="padding:4px 0;font-size:13px;color:#dc2626;font-weight:600;white-space:nowrap;">${escapeHtml(p.currency)} ${balanceDue.toFixed(2)}</td>
      </tr>` : ""}
    </table>

    <!-- ── STATUS BANNER ── -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:${isCash || isDeposit ? "#fff7ed" : "#f0fdf4"};border:1px solid ${isCash || isDeposit ? "#fed7aa" : "#86efac"};border-radius:10px;padding:16px 20px;text-align:center;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${isCash || isDeposit ? "#c2410c" : "#15803d"};">
            &#10003; ${isCash ? "Booking received — payment due in person" : isDeposit ? "Deposit received — booking secured!" : "Paid in full — you&rsquo;re all set!"}
          </p>
          <p style="margin:0;font-size:12px;color:${isCash || isDeposit ? "#9a3412" : "#166534"};">
            ${isCash
              ? `Please bring <strong>${escapeHtml(p.currency)} ${balanceDue.toFixed(2)}</strong> and pay in person on the day of your tour.`
              : isDeposit
              ? `Please settle the remaining balance of <strong>${escapeHtml(p.currency)} ${balanceDue.toFixed(2)}</strong> before your tour date.`
              : "No further payment is required. We look forward to seeing you!"}
          </p>
        </td>
      </tr>
    </table>

    <!-- ── NEXT STEPS ── -->
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
      If you have any questions or need to make changes, reply to this email or reach us at
      <a href="mailto:bookings@sabarytours.com" style="color:#ff5e00;font-weight:700;text-decoration:none;">bookings@sabarytours.com</a>.
    </p>
  `;

  const issued = new Date();
  const issuedLabel = issued.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return buildEmailHtml({
    documentType: "Booking Confirmation",
    metaRows: [
      { label: "Booking ref", value: escapeHtml(p.paymentReference) },
      { label: "Date", value: escapeHtml(issuedLabel) },
      { label: "Customer", value: escapeHtml(p.customerName) },
      { label: "Tour", value: escapeHtml(p.tourName) },
    ],
    body,
  });
}

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
