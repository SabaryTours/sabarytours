import {
  buildBookingAdminNotificationHtml,
  type BookingAdminNotificationInput,
} from "./bookingAdminEmailHtml";
import { BOOKINGS_NOTIFY_EMAIL, FROM_EMAIL, resend } from "./resend";

export async function sendBookingAdminNotification(
  input: BookingAdminNotificationInput,
): Promise<void> {
  try {
    const isCash = input.paymentOption === "cash";
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [BOOKINGS_NOTIFY_EMAIL],
      replyTo: input.customerEmail,
      subject: `${isCash ? "New cash reservation" : "New booking"} — ${input.tourName} (${input.customerName})`,
      html: buildBookingAdminNotificationHtml(input),
    });
    if (error) {
      console.error("[Resend] Booking admin notification failed:", error);
    }
  } catch (err) {
    console.error("[Resend] Booking admin notification error:", err);
  }
}
