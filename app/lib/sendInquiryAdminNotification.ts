import { BOOKINGS_NOTIFY_EMAIL, FROM_EMAIL, INFO_NOTIFY_EMAIL, resend } from "./resend";
import {
  buildInquiryAdminNotificationHtml,
  type InquiryAdminNotificationInput,
} from "./bookingAdminEmailHtml";

export async function sendInquiryAdminNotification(
  input: InquiryAdminNotificationInput,
  options?: { to?: string },
): Promise<void> {
  const to =
    options?.to ||
    (input.source === "contact" ? INFO_NOTIFY_EMAIL : BOOKINGS_NOTIFY_EMAIL);

  try {
    const label =
      input.source === "customized_package"
        ? "Customized trip request"
        : input.source === "contact"
          ? "Contact form"
          : "Inquiry";
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
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
