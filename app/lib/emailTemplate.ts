/**
 * Shared email template wrapper — invoices & receipts.
 * White-on-white branding with Unlimited Pie font for headers.
 * Table-based layout with inline styles for maximum email-client compatibility.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://sabarytours.com";

const LOGO_URL  = `${BASE_URL}/assets/logo.svg`;
const FONT_URL  = `${BASE_URL}/assets/fonts/unlimited_pie/UnlimitedPie.otf`;

/** Heading style that uses Unlimited Pie with an Arial/system fallback */
const PIE = `font-family:'UnlimitedPie',Arial Black,Arial,sans-serif;`;

export function buildEmailHtml({
  documentType,
  metaRows,
  body,
}: {
  documentType: string;
  metaRows: { label: string; value: string }[];
  body: string;
}): string {
  const metaHtml = metaRows
    .map(
      ({ label, value }) => `
      <tr>
        <td style="padding:3px 16px 3px 0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:3px 0;font-size:13px;color:#111827;font-weight:600;vertical-align:top;">${value}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${documentType}</title>
  <style>
    @font-face {
      font-family: 'UnlimitedPie';
      src: url('${FONT_URL}') format('opentype');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background-color:#f4f5f7;">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">

      <!-- ── CARD ── -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- ── WHITE HEADER: logo + document title ── -->
        <tr>
          <td style="background-color:#ffffff;padding:36px 40px 24px;text-align:center;border-bottom:3px solid #ff5e00;">
            <!-- Logo -->
            <img src="${LOGO_URL}"
                 alt="Sabary Travel and Tours"
                 width="140" height="46"
                 style="display:block;margin:0 auto 16px;max-width:140px;height:46px;object-fit:contain;" />
            <!-- Document type in Unlimited Pie -->
            <h1 style="margin:0;${PIE}font-size:28px;font-weight:normal;letter-spacing:3px;text-transform:uppercase;color:#111827;line-height:1;">
              ${documentType.replace(/&amp;/g, "&")}
            </h1>
          </td>
        </tr>

        <!-- ── META STRIP ── -->
        <tr>
          <td style="background-color:#f9fafb;border-bottom:1px solid #e5e7eb;padding:16px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              ${metaHtml}
            </table>
          </td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td style="background-color:#ffffff;padding:36px 40px;">
            ${body}
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background-color:#111827;padding:24px 40px;text-align:center;border-radius:0 0 16px 16px;">
            <p style="margin:0 0 4px;${PIE}font-size:16px;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">
              Sabary
            </p>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;letter-spacing:0.5px;text-transform:uppercase;">
              Travel &amp; Tours
            </p>
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">
              Greda Estate, 6th Avenue &middot; Accra, Ghana
            </p>
            <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;">
              <a href="mailto:bookings@sabarytours.com"
                 style="color:#ff5e00;text-decoration:none;font-weight:700;">bookings@sabarytours.com</a>
              <span style="color:#4b5563;">&nbsp;&middot;&nbsp;</span>
              <span style="color:#6b7280;">+233 576 093 838</span>
            </p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#374151;letter-spacing:0.3px;">
              &copy; ${new Date().getFullYear()} Sabary Travel and Tours. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
      <!-- ── END CARD ── -->

    </td>
  </tr>
</table>

</body>
</html>`;
}
