import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";
import dotenv from "dotenv";

dotenv.config();

const sendEmailNow = (email, from, subject, html) => {
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.EMAIL_API_KEY,
      },
    })
  );

  const userData = {
    to: email,
    from: from,
    subject: subject,
    html: html,
  };
  transporter.sendMail(userData);
};

export { sendEmailNow };
