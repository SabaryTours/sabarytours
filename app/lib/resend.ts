import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_DISPLAY_NAME = "Sabary Tours";
const DEFAULT_SENDER_ADDRESS = "bookings@sabarytours.com";
const DEFAULT_BOOKINGS_NOTIFY_ADDRESS = "bookings@sabarytours.com";

/** Always show "Sabary Tours" as the sender name; env may supply only the address. */
function buildFromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) {
    return `${SENDER_DISPLAY_NAME} <${DEFAULT_SENDER_ADDRESS}>`;
  }

  const formatted = raw.match(/^[^<]*<([^>]+)>$/);
  if (formatted) {
    return `${SENDER_DISPLAY_NAME} <${formatted[1].trim()}>`;
  }

  if (raw.includes("@")) {
    return `${SENDER_DISPLAY_NAME} <${raw}>`;
  }

  return `${SENDER_DISPLAY_NAME} <${DEFAULT_SENDER_ADDRESS}>`;
}

// Must match a verified domain in your Resend dashboard.
// RESEND_FROM_EMAIL can be `bookings@sabarytours.com` or `onboarding@resend.dev` — display name is always Sabary Tours.
export const FROM_EMAIL = buildFromAddress();

/** Inbox that receives booking alerts and trip enquiries. */
export const BOOKINGS_NOTIFY_EMAIL =
  process.env.BOOKINGS_NOTIFY_EMAIL?.trim() || DEFAULT_BOOKINGS_NOTIFY_ADDRESS;

/** Contact form and general info enquiries. */
export const INFO_NOTIFY_EMAIL =
  process.env.INFO_NOTIFY_EMAIL?.trim() || "info@sabarytours.com";

export const PAYMENT_OPTIONS_HTML = `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:8px;">
    <tr>
      <td style="padding:10px 0; border-top:1px solid #e5e7eb;">
        <div style="font-size:13px; font-weight:700; color:#111827; margin-bottom:10px;">Payment Options</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; font-size:12px; color:#374151;">
          <tr>
            <td style="padding:6px 0; vertical-align:top; width:28px;">
              <span style="display:inline-block; background:#ffcc00; color:#111; font-weight:700; font-size:10px; padding:2px 5px; border-radius:4px;">MTN</span>
            </td>
            <td style="padding:6px 0 6px 8px;">
              <span style="color:#6b7280;">MTN Mobile Money:</span><br/>
              <strong>0598952236</strong> &mdash; Sabary Travel and Tour
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0; vertical-align:top;">
              <span style="display:inline-block; background:#d32f2f; color:#fff; font-weight:700; font-size:10px; padding:2px 5px; border-radius:4px;">AT</span>
            </td>
            <td style="padding:6px 0 6px 8px;">
              <span style="color:#6b7280;">Airtel Tigo:</span><br/>
              <strong>0576093838</strong> &mdash; Sabary Travel and Tour
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0; vertical-align:top;">
              <span style="display:inline-block; background:#003580; color:#fff; font-weight:700; font-size:10px; padding:2px 5px; border-radius:4px;">GT</span>
            </td>
            <td style="padding:6px 0 6px 8px;">
              <span style="color:#6b7280;">GT Bank Account:</span><br/>
              <strong>206115998220</strong> &mdash; Sabary Travel and Tour
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;
