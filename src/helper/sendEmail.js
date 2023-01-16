import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";
import dotenv from "dotenv";

dotenv.config();

const sendEmailNow = async (email, from, subject, html) => {
  try {
    const transporter = nodemailer.createTransport(
      sendgridTransport({
        auth: {
          api_key: process.env.API_KEY,
        },
      })
    );

    const userData = {
      to: email,
      from: from,
      subject: subject,
      html: html,
    };
    await transporter.sendMail(userData);
  } catch (error) {
    console.log(error);
  }
};

export { sendEmailNow };
