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

/**
 * Mandrill-safe HTML matching the custom invoice email layout (blue rule, two-column header, line items).
 * No payment button — offline payment acknowledgement only.
 */
export function buildOfflinePaymentReceiptEmailHtml(p: OfflineReceiptEmailInput): string {
  const phoneBlock = p.customerPhone
    ? `<div style="font-size: 13px; color: #6b7280; margin-top: 2px;">${escapeHtml(p.customerPhone)}</div>`
    : "";
  const timePart = p.timeSlot ? ` at ${escapeHtml(p.timeSlot)}` : "";
  const activitiesBlock = p.includedActivities
    ? `<div style="font-size: 12px; color: #6b7280; margin-top: 6px;">${escapeHtml(p.includedActivities)}</div>`
    : "";
  const refRow = p.paymentReference
    ? `<tr>
          <td style="padding: 2px 8px;">Reference:</td>
          <td style="padding: 2px 0;">${escapeHtml(p.paymentReference)}</td>
        </tr>`
    : "";
  const paidFull = p.balanceDue <= 0.009;

  return `
                <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; background-color: #f5f7fb; padding: 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                    <tr>
                      <td style="padding: 24px 24px 16px 24px; border-bottom: 4px solid #0060cc;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                          <tr>
                            <td style="vertical-align: top;">
                              <div style="font-weight: 700; font-size: 18px; color: #111827; margin-bottom: 4px;">Sabary Travel and Tours</div>
                              <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                                Greda Estate, 6th Avenue<br/>
                                Accra, Ghana<br/>
                                bookings@sabarytours.com<br/>
                                +233 576 093 838
                              </div>
                            </td>
                            <td style="text-align: right; vertical-align: top;">
                              <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #0060cc; margin-bottom: 8px;">Payment receipt</div>
                              <table cellpadding="0" cellspacing="0" style="font-size: 12px; color: #4b5563; margin-left: auto;">
                                <tr>
                                  <td style="padding: 2px 8px;">Date:</td>
                                  <td style="padding: 2px 0;">${escapeHtml(p.issuedDateLabel)}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 2px 8px;">Receipt #:</td>
                                  <td style="padding: 2px 0;">${escapeHtml(p.receiptNumber)}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 2px 8px;">Customer:</td>
                                  <td style="padding: 2px 0;">${escapeHtml(p.customerName)}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 2px 8px;">Payment method:</td>
                                  <td style="padding: 2px 0;">${escapeHtml(p.paymentMethod)}</td>
                                </tr>
                                ${refRow}
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                          <tr>
                            <td style="vertical-align: top; padding-right: 16px;">
                              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;">Received from</div>
                              <div style="font-size: 14px; font-weight: 600; color: #111827;">${escapeHtml(p.customerName)}</div>
                              <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">${escapeHtml(p.customerEmail)}</div>
                              ${phoneBlock}
                            </td>
                            <td style="vertical-align: top; padding-left: 16px; border-left: 1px solid #e5e7eb;">
                              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;">Booking details</div>
                              <div style="font-size: 13px; color: #374151; line-height: 1.6;">
                                <div><span style="color:#6b7280;">Tour / package:</span> <strong>${escapeHtml(p.tourName)}</strong></div>
                                <div><span style="color:#6b7280;">Date:</span> <strong>${escapeHtml(p.tourDate)}${timePart}</strong></div>
                                <div><span style="color:#6b7280;">Guests:</span> <strong>${p.numberOfPeople}</strong></div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-top: 1px solid #e5e7eb;">
                          <thead>
                            <tr>
                              <th align="left" style="padding: 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280;">Description</th>
                              <th align="right" style="padding: 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280;">Amount (${escapeHtml(p.currency)})</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style="padding: 10px 0; font-size: 13px; color: #374151; border-top: 1px solid #e5e7eb;">
                                <div style="font-weight: 600;">${escapeHtml(p.tourName)}</div>
                                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                                  Booking for ${p.numberOfPeople} guest${p.numberOfPeople > 1 ? "s" : ""} on ${escapeHtml(p.tourDate)}${timePart}.
                                </div>
                                ${activitiesBlock}
                              </td>
                              <td style="padding: 10px 0; font-size: 13px; color: #111827; font-weight: 600; border-top: 1px solid #e5e7eb;" align="right">
                                ${p.totalCost.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 24px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                          <tr>
                            <td></td>
                            <td width="240" style="font-size: 13px; color: #374151;">
                              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                  <td align="left" style="padding: 4px 0; color:#6b7280;">Booking total</td>
                                  <td align="right" style="padding: 4px 0;">${escapeHtml(p.currency)} ${p.totalCost.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td align="left" style="padding: 4px 0; color:#6b7280;">Previously paid</td>
                                  <td align="right" style="padding: 4px 0;">${escapeHtml(p.currency)} ${p.amountPreviouslyPaid.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td align="left" style="padding: 4px 0; color:#111827; font-weight:700;">This payment (${escapeHtml(p.paymentMethod)})</td>
                                  <td align="right" style="padding: 4px 0; font-weight:700;">${escapeHtml(p.currency)} ${p.amountReceived.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td align="left" style="padding: 4px 0; font-weight:700; border-top:1px solid #e5e7eb; padding-top:8px;">Total paid to date</td>
                                  <td align="right" style="padding: 4px 0; font-weight:700; border-top:1px solid #e5e7eb; padding-top:8px;">${escapeHtml(p.currency)} ${p.newAmountPaid.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td align="left" style="padding: 4px 0; color:#6b7280;">Balance due</td>
                                  <td align="right" style="padding: 4px 0;">${escapeHtml(p.currency)} ${Math.max(p.balanceDue, 0).toFixed(2)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px 28px 24px; text-align: center;">
                        <div style="background-color: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 12px; padding: 14px 18px; display: inline-block; max-width: 100%;">
                          <div style="font-size: 13px; font-weight: 700; color: #065f46; margin-bottom: 4px;">${paidFull ? "Thank you — booking paid in full" : "Payment received — thank you"}</div>
                          <div style="font-size: 12px; color: #047857; line-height: 1.5;">
                            This receipt confirms we recorded your payment by <strong>${escapeHtml(p.paymentMethod)}</strong>.
                            ${paidFull ? " No further payment is required for this booking total." : " Please arrange payment of any remaining balance before your tour date."}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <p style="margin-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
                    Thank you for choosing Sabary Tours. Questions? Reply to this email or contact bookings@sabarytours.com
                  </p>
                </div>
              `;
}
