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

export { sendmail };
