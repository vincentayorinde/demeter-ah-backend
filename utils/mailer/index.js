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
    to: 'no-reply@authors-haven.com',
    bcc: email,
    subject,
    html: content,
  };
  try {
    await transporter.sendMail(data);
  } catch (e) {
    /* istanbul ignore next */
    throw new Error('mail not sent', e);
  }
};
