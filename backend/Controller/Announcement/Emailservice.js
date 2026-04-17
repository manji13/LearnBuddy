const transporter = require('../../utils/emailTransporter');

// ── Gmail transporter setup is centralized in backend/utils/emailTransporter.js
// Add these to your .env file:
//   EMAIL_USER=your_gmail@gmail.com
//   EMAIL_PASS=your_gmail_app_password
//
// How to get Gmail App Password:
//   1. Google Account → Security → Enable 2-Step Verification
//   2. Security → App Passwords → Generate for "Mail"
//   3. Copy the 16-digit code into EMAIL_PASS (NOT your Gmail login password)

/**
 * Send announcement notification to all users
 * @param {string[]} emails      - Array of recipient email addresses
 * @param {string}   topic       - Announcement topic
 * @param {string}   description - Announcement description
 * @param {Date}     createdAt   - Announcement creation date
 */
const sendAnnouncementEmail = async (emails, topic, description, createdAt) => {
  if (!emails || emails.length === 0) return;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>New Announcement</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">
                    📢 New Announcement
                  </p>
                  <h1 style="margin:0;font-size:26px;color:#ffffff;font-weight:800;line-height:1.3;">
                    ${topic}
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background:#ffffff;padding:36px 40px;">

                  <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">
                    Details
                  </p>
                  <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.8;white-space:pre-wrap;">
                    ${description}
                  </p>

                  <!-- Date box -->
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="background:#f9fafb;border-radius:10px;padding:16px 20px;border-left:4px solid #4f46e5;">
                        <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;">
                          📅 Posted On
                        </p>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
                          ${formattedDate}
                        </p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                    This is an automated notification from <strong>LearnBuddy</strong>.<br/>
                    Please do not reply to this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  const mailOptions = {
    from: `"LearnBuddy" <${process.env.EMAIL_USER}>`,
    bcc: emails,   // BCC keeps each user's email private from others
    subject: `📢 New Announcement: ${topic}`,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Announcement email sent to ${emails.length} user(s). MessageId: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Failed to send announcement email:', error.message);
    throw error;
  }
};

module.exports = { sendAnnouncementEmail };