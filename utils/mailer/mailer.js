import nodemailer from 'nodemailer';

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});
const mailOptions = (to, subject, html) => ({
  from: '"Authors Haven" <hello@authorshaven.com>',
  to,
  subject,
  html
});
export default { transporter, mailOptions };
