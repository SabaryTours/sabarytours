import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = 'Sabary Travel and Tours <bookings@sabarytours.com>';

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
