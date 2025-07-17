import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (
  fromAddress: string,
  to: string,
  subject: string,
  body: string,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    text: body,
    html: `<p>${body}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`\u2705 Email successfully sent to: ${to}`);
  } catch (err) {
    console.error(`\u274c Failed to send email to ${to}:`, err);
    throw err;
  }
};
