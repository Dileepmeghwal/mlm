import nodemailer from "nodemailer";

async function sendmail(email: string, otp: string): Promise<void> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }

  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    // secure: false,
    auth: {
      user: "support@dtfindia.org",
      pass: "1@Dtfindia#harish",
    },
  });

  
  // Verify the connection configuration
  const mailOptions = {
    from: `"Team DTF" <support@dtfindia.org>`,
    to: email,
    subject: "Your OTP Code",
    html: `
                        <p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes. Do not share this with others.</p>
                        <p>Regards,<br>Team DTF</p>
                `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

/**
 * Send password reset email
 * @param email - User's email address
 * @param resetLink - Password reset link to include in email
 * @param firstName - User's first name for personalization
 */
async function sendResetPasswordEmail(
  email: string,
  resetLink: string,
  firstName: string = "User"
): Promise<void> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }

  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    auth: {
      user: process.env.SMTP_USER || "support@dtfindia.org",
      pass: process.env.SMTP_PASSWORD || "1@Dtfindia#harish",
    },
  });

  const resetLinkExpiresIn = "15 minutes"; // Match the token expiry time
  const currentYear = new Date().getFullYear();

  const mailOptions = {
    from: `"Team DTF" <support@dtfindia.org>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; border-top: 1px solid #ddd; }
            .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Password Reset Request</h2>
            </div>

            <div class="content">
              <p>Hi ${firstName},</p>

              <p>We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.</p>

              <p>To reset your password, click the button below:</p>

              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>

              <p style="font-size: 12px; color: #666;">
                Or copy and paste this link in your browser:<br>
                <code style="background-color: #f4f4f4; padding: 5px; border-radius: 3px; word-break: break-all;">
                  ${resetLink}
                </code>
              </p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in ${resetLinkExpiresIn}. After that, you'll need to request a new password reset.
              </div>

              <p><strong>For your security:</strong></p>
              <ul>
                <li>Never share this link with anyone</li>
                <li>We'll never ask for your password via email</li>
                <li>If you don't recognize this activity, please contact our support team immediately</li>
              </ul>

              <p>Regards,<br><strong>Team DTF</strong></p>
            </div>

            <div class="footer">
              <p>&copy; ${currentYear} DTF India. All rights reserved.</p>
              <p>
                If you have any questions, contact us at
                <a href="mailto:support@dtfindia.org">support@dtfindia.org</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

export { sendmail, sendResetPasswordEmail };
