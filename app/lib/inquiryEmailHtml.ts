import { buildEmailHtml } from "./emailTemplate";
import { escapeHtml } from "./bookingReceiptEmailHtml";

const BOOKINGS_EMAIL = "bookings@sabarytours.com";
const BOOKINGS_PHONE = "+233 576 093 838";

export function buildContactAutoReplyHtml(firstName: string): string {
  const body = `
    <p style="margin:0 0 18px;font-size:16px;color:#374151;line-height:1.65;">
      Thank you for contacting Sabary Tours.
    </p>
    <p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.65;">
      We&rsquo;ve successfully received your inquiry and a member of our team will get back to you as soon as possible. We aim to respond within <strong>1&ndash;3 business days</strong>.
    </p>
    <p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.65;">
      For urgent booking assistance, please contact us at
      <a href="mailto:${BOOKINGS_EMAIL}" style="color:#ff5e00;font-weight:700;text-decoration:none;">${BOOKINGS_EMAIL}</a>
      or <a href="tel:${BOOKINGS_PHONE.replace(/\s/g, "")}" style="color:#ff5e00;font-weight:700;text-decoration:none;">${BOOKINGS_PHONE}</a>.
    </p>
    <p style="margin:0;font-size:15px;color:#374151;line-height:1.65;">
      We look forward to helping you discover the beauty of Ghana.
    </p>
  `;

  return buildEmailHtml({
    documentType: "Thank You for Contacting Us",
    metaRows: [{ label: "Guest", value: escapeHtml(firstName) }],
    body,
  });
}

export function buildCustomizedTripAutoReplyHtml(firstName: string): string {
  const body = `
    <p style="margin:0 0 18px;font-size:16px;color:#374151;line-height:1.65;">
      Hi <strong>${escapeHtml(firstName)}</strong>, thank you for your customized tour request.
    </p>
    <p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.65;">
      We&rsquo;ve received your customized tour request. Since each itinerary is tailored specifically to your preferences, our team will carefully craft a personalized proposal for you.
    </p>
    <p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.65;">
      We aim to respond with your custom itinerary and quotation within <strong>3&ndash;5 business days</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.65;">
      Questions in the meantime? Email
      <a href="mailto:${BOOKINGS_EMAIL}" style="color:#ff5e00;font-weight:700;text-decoration:none;">${BOOKINGS_EMAIL}</a>
      or call <a href="tel:${BOOKINGS_PHONE.replace(/\s/g, "")}" style="color:#ff5e00;font-weight:700;text-decoration:none;">${BOOKINGS_PHONE}</a>.
    </p>
  `;

  return buildEmailHtml({
    documentType: "Customized Tour Request Received",
    metaRows: [{ label: "Guest", value: escapeHtml(firstName) }],
    body,
  });
}

export const CUSTOMIZED_TRIP_SUCCESS_MESSAGE =
  "Thank you! We've received your customized tour request. Since each itinerary is tailored specifically to your preferences, our team will carefully craft a personalized proposal for you. We aim to respond with your custom itinerary and quotation within 3–5 business days.";

export const CONTACT_SUCCESS_MESSAGE =
  "Thank you! Your message has been sent. Check your email for a confirmation — we'll reply within 1–3 business days.";

export const NEWSLETTER_SUCCESS_MESSAGE =
  "Thanks for subscribing! 🎉🎊\n\nGet ready for exciting travel stories, insider tips, upcoming tours, hidden gems in Ghana, and exclusive Sabary Tours offers delivered straight to your inbox.📥";

export function buildNewsletterWelcomeHtml(): string {
  const body = `
    <p style="margin:0 0 18px;font-size:16px;color:#374151;line-height:1.65;">
      Thanks for subscribing! 🎉
    </p>
    <p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.65;">
      Get ready for exciting travel stories, insider tips, upcoming tours, hidden gems in Ghana, and exclusive Sabary Tours offers delivered straight to your inbox.
    </p>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.65;">
      We&rsquo;re glad you&rsquo;re here. Your next Ghana adventure starts with what lands in your inbox.
    </p>
  `;

  return buildEmailHtml({
    documentType: "Welcome to Sabary Tours",
    metaRows: [{ label: "Newsletter", value: "You&rsquo;re subscribed" }],
    body,
  });
}
