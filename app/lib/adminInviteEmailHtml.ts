import { buildEmailHtml } from "./emailTemplate";
import { escapeHtml } from "./bookingReceiptEmailHtml";

export function buildAdminInviteEmailHtml(params: {
  inviteLink: string;
  email: string;
  name: string;
  role: string;
}): string {
  const roleLabel = params.role[0].toUpperCase() + params.role.slice(1);
  const body = `
    <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.6;">
      Hi <strong style="color:#111827;">${escapeHtml(params.name)}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
      You&rsquo;ve been invited to join the Sabary Tours admin dashboard as
      <strong style="color:#111827;">${escapeHtml(roleLabel)}</strong>.
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.6;">
      Click the button below to set your password and activate your account
      (<strong style="color:#111827;">${escapeHtml(params.email)}</strong>).
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td style="border-radius:9999px;background:#ff5e00;">
          <a href="${escapeHtml(params.inviteLink)}"
             style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
            Set password &amp; join
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;font-size:13px;color:#6b7280;line-height:1.6;">
      If the button doesn&rsquo;t work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:12px;color:#0060cc;word-break:break-all;line-height:1.5;">
      ${escapeHtml(params.inviteLink)}
    </p>
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      If you weren&rsquo;t expecting this invitation, you can ignore this email.
    </p>
  `;

  return buildEmailHtml({
    documentType: "Admin Invitation",
    metaRows: [
      { label: "Email", value: escapeHtml(params.email) },
      { label: "Role", value: escapeHtml(roleLabel) },
    ],
    body,
  });
}
