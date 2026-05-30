import { BOOKINGS_NOTIFY_EMAIL, FROM_EMAIL, resend } from "./resend";
import {
  buildInquiryAdminNotificationHtml,
  type InquiryAdminNotificationInput,
} from "./bookingAdminEmailHtml";

export async function sendInquiryAdminNotification(
  input: InquiryAdminNotificationInput,
): Promise<void> {
  try {
    const label =
      input.source === "customized_package" ? "Customized trip request" : "Contact message";
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [BOOKINGS_NOTIFY_EMAIL],
      replyTo: input.email,
      subject: `${label}: ${input.subject}`,
      html: buildInquiryAdminNotificationHtml(input),
    });
    if (error) {
      console.error("[Resend] Inquiry admin notification failed:", error);
    }
  } catch (err) {
    console.error("[Resend] Inquiry admin notification error:", err);
  }
}
