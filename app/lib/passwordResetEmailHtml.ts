import { buildEmailHtml } from "./emailTemplate";
import { escapeHtml } from "./bookingReceiptEmailHtml";

export function buildPasswordResetEmailHtml(params: {
  resetLink: string;
  email: string;
}): string {
  const body = `
    <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.6;">
      We received a request to reset the password for your Sabary Tours account
      (<strong style="color:#111827;">${escapeHtml(params.email)}</strong>).
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.6;">
      Click the button below to choose a new password. This link expires after a short time
      and can only be used once.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td style="border-radius:9999px;background:#ff5e00;">
          <a href="${escapeHtml(params.resetLink)}"
             style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
            Reset password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;font-size:13px;color:#6b7280;line-height:1.6;">
      If the button doesn&rsquo;t work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:12px;color:#0060cc;word-break:break-all;line-height:1.5;">
      ${escapeHtml(params.resetLink)}
    </p>
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      If you didn&rsquo;t request a password reset, you can safely ignore this email.
    </p>
  `;

  return buildEmailHtml({
    documentType: "Password Reset",
    metaRows: [{ label: "Account", value: escapeHtml(params.email) }],
    body,
  });
}
