import { buildEmailHtml } from "./emailTemplate";
import { escapeHtml } from "./bookingReceiptEmailHtml";

export type BookingAdminNotificationInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  tourName: string;
  tourDate: string;
  timeSlot?: string | null;
  numberOfPeople: number;
  pickupLocation?: string | null;
  paymentReference: string;
  paymentOption: "full" | "deposit" | "cash";
  amountPaid: number;
  totalCost: number;
  currency?: string;
  bookingId?: string;
};

export type InquiryAdminNotificationInput = {
  source: "contact" | "customized_package";
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
};

export function buildBookingAdminNotificationHtml(
  p: BookingAdminNotificationInput,
): string {
  const currency = p.currency || "GHS";
  const timePart = p.timeSlot ? ` at ${escapeHtml(p.timeSlot)}` : "";
  const isCash = p.paymentOption === "cash";

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
      A new ${isCash ? "cash reservation" : "paid booking"} was submitted on the website.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:20px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Guest</p>
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">${escapeHtml(p.customerName)}</p>
          <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">${escapeHtml(p.customerEmail)}</p>
          ${p.customerPhone ? `<p style="margin:0;font-size:13px;color:#6b7280;">${escapeHtml(p.customerPhone)}</p>` : ""}
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#fff7ed;border-radius:12px;border:1px solid #fed7aa;margin-bottom:20px;">
      <tr>
        <td style="padding:20px 24px;font-size:13px;color:#374151;line-height:1.8;">
          <p style="margin:0 0 8px;"><strong>Tour:</strong> ${escapeHtml(p.tourName)}</p>
          <p style="margin:0 0 8px;"><strong>Date:</strong> ${escapeHtml(p.tourDate)}${timePart}</p>
          <p style="margin:0 0 8px;"><strong>Guests:</strong> ${p.numberOfPeople}</p>
          ${p.pickupLocation ? `<p style="margin:0 0 8px;"><strong>Pick-up:</strong> ${escapeHtml(p.pickupLocation)}</p>` : ""}
          <p style="margin:0 0 8px;"><strong>Reference:</strong> ${escapeHtml(p.paymentReference)}</p>
          <p style="margin:0 0 8px;"><strong>Payment:</strong> ${escapeHtml(p.paymentOption)}</p>
          <p style="margin:0;"><strong>Total:</strong> ${escapeHtml(currency)} ${p.totalCost.toFixed(2)} &nbsp;|&nbsp; <strong>Paid now:</strong> ${escapeHtml(currency)} ${p.amountPaid.toFixed(2)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#6b7280;">
      View and manage this booking in the admin dashboard.
    </p>
  `;

  return buildEmailHtml({
    documentType: "New Booking Alert",
    metaRows: [
      { label: "Reference", value: escapeHtml(p.paymentReference) },
      { label: "Guest", value: escapeHtml(p.customerName) },
      { label: "Tour", value: escapeHtml(p.tourName) },
      { label: "Status", value: isCash ? "Cash — pending payment" : "Paid online" },
    ],
    body,
  });
}

export function buildInquiryAdminNotificationHtml(p: InquiryAdminNotificationInput): string {
  const sourceLabel =
    p.source === "customized_package" ? "Customized trip request" : "Contact form message";

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
      You received a new ${escapeHtml(sourceLabel.toLowerCase())} on sabarytours.com.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-bottom:20px;">
      <tr>
        <td style="padding:20px 24px;font-size:13px;color:#374151;line-height:1.8;">
          <p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(p.name)}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(p.email)}</p>
          ${p.phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${escapeHtml(p.phone)}</p>` : ""}
          <p style="margin:0 0 8px;"><strong>Subject:</strong> ${escapeHtml(p.subject)}</p>
        </td>
      </tr>
    </table>
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;">
      <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Message</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${escapeHtml(p.message)}</p>
    </div>
  `;

  return buildEmailHtml({
    documentType: sourceLabel,
    metaRows: [
      { label: "From", value: escapeHtml(p.name) },
      { label: "Email", value: escapeHtml(p.email) },
      { label: "Subject", value: escapeHtml(p.subject) },
    ],
    body,
  });
}
