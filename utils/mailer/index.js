import nodemailer from 'nodemailer';

require('dotenv').config();

export const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendMail = async ({ email, subject, content }) => {
  const data = {
    from: '"Authors Haven" <support@authorshaven.com>',
    to: email,
    subject,
    html: content,
  };
  try {
    await transporter.sendMail(data);
    console.log('mail sent successfully');
  } catch (e) {
    console.log('na the error be this', e);
    throw new Error('mail not sent');
  }
};
