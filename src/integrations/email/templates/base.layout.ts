/**
 * Base Responsive HTML Email Layout
 * HopeHorizon / Vikas NGO Ecosystem
 */

export interface EmailLayoutProps {
  title: string;
  previewText?: string;
  bodyHtml: string;
  recipientEmail?: string;
}

export function renderEmailLayout({
  title,
  previewText = '',
  bodyHtml,
}: EmailLayoutProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #087F5B 0%, #066246 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .brand-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      color: #e6fcf5;
      font-size: 13px;
      margin: 6px 0 0 0;
    }
    .content {
      padding: 36px 40px;
      line-height: 1.6;
      font-size: 15px;
      color: #334155;
    }
    .button {
      display: inline-block;
      background-color: #087F5B;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      font-weight: 600;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .otp-code {
      display: inline-block;
      font-family: monospace, Courier;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 6px;
      color: #087F5B;
      background-color: #e6fcf5;
      padding: 12px 24px;
      border-radius: 8px;
      border: 1px dashed #0ca678;
      margin: 20px 0;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer-links a {
      color: #087F5B;
      text-decoration: none;
      margin: 0 8px;
    }
    .statutory-notice {
      margin-top: 12px;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1 class="brand-title">HopeHorizon NGO</h1>
              <p class="brand-tagline">Empowering Communities, Transforming Lives</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="content">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 8px 0; font-weight: 500;">HopeHorizon Foundation</p>
              <p style="margin: 0 0 12px 0;">New Delhi, India | contact@hopehorizon.org</p>
              <div class="footer-links">
                <a href="https://hopehorizon.org/transparency">Transparency</a> &bull;
                <a href="https://hopehorizon.org/legal">Legal & Compliance</a> &bull;
                <a href="https://hopehorizon.org/faq">FAQ</a>
              </div>
              <p class="statutory-notice">
                Registered under Section 80G & 12A of the Income Tax Act. Darpan ID: DL/2023/0342918. All donations are 50% tax exempt.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
