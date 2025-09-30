import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP details from SendGrid/Postmark/Resend
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your app password (not raw Gmail password!)
  },
});

export const sendMail = async (to: string[], subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Clubly" <${process.env.EMAIL_USER}>`,
    bcc: to, // use BCC so users don’t see each other’s emails
    subject,
    html,
  });
};
