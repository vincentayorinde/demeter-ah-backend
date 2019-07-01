import consola from 'consola';
import crypto from 'crypto';
import { Sequelize } from 'sequelize';
import db from '../db/models';
import mailer from '../utils/mailer/mailer';
import token from '../utils/jwt/token';

let activationToken;
const send = (email) => {
  const url = `http://localhost:5000/activate/${activationToken}`;
  const data = {
    from: '"Authors Haven" <activate@authorshaven.com>',
    to: email,
    subject: 'Activate Account',
    html: `
      Hello <b>${email}</b>, <br><br> Welcome to Authors Haven! <br>
      Please click on this <b><a href="${url}">Link</a></b> to verify your account. <br> <br>
      Regards,<br>
      The Support Team.
      `,
  };

  mailer.transporter.sendMail(data, (err, res) => {
    if (err) {
      consola.error(err);
    }
    return res.status(200).json({
      message: 'Activation Email successfully sent',
    });
  });
};

const sendLink = (email, resetToken) => {
  const url = `http://localhost:4001/change-password?resetToken=${resetToken}`;
  const data = {
    from: '"Authors Haven" <activate@authorshaven.com>',
    to: email,
    subject: 'Password Reset Link',
    html: `
      Hello <b>${email}</b>, <br>
      Please click on this <b><a href="${url}">Link</a></b> to reset your password. <br> <br>
      Regards,<br>
      The Support Team.
      `,
  };

  mailer.transporter.sendMail(data, (err, res) => {
    if (err) {
      consola.error(err);
    }
    return res.status(200).json({
      message: 'Password reset link successfully sent',
    });
  });
};

const signup = async (req, res) => {
  const { name, password, email } = req.body;
  activationToken = token.getActivationToken(email);
  try {
    await db.tempUsers.create({
      name,
      password,
      email,
      activationToken,
    });
    await send(email);
    return res.status(201).json({
      message: 'Registration successfull, Please check email to activate account!',
    });
  } catch (e) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
};

const activate = async (req, res) => {
  try {
    const user = await db.tempUsers
      .findOne({ where: { activationToken: req.params.token, activated: false } })
      .then((active) => {
        if (active) {
          active.update({ activated: true });
          return res.status(200).json({
            message: 'Activation successful, You can now login',
          });
        }
      });
    if (!user) {
      return res.status(400).json({
        error: 'Invalid activation Link',
      });
    }
  } catch (e) {
    return res.status(400).json({
      message: 'Bad request',
    });
  }
};

const sendResetLink = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.tempUsers.findOne({ where: { email } });
    if (user) {
      const resetToken = crypto.randomBytes(64).toString('hex');
      const date = new Date();
      date.setHours(date.getHours() + 2);
      user.update({ resetToken, resetExpire: date });
      await sendLink(user.email, resetToken);
      return res.status(200).json({
        message: 'Password reset successful. Check your email for password reset link!',
      });
    }
    throw new Error('User not found');
  } catch (err) {
    return res.status(400).json({
      message: 'Bad request',
    });
  }
};

const changePassword = async (req, res) => {
  const { password } = req.body;
  const { Op } = Sequelize;
  // hash password here

  const { resetToken } = req.query;
  try {
    const user = await db.tempUsers.findOne({
      where: {
        resetToken,
        resetExpire: {
          [Op.gt]: new Date(),
        },
      },
    });
    if (user) {
      user.update({ password, resetToken: null, resetExpire: null });
      return res.status(200).json({
        message: 'Password has successfully been changed.',
      });
    }
    throw new Error('Invalid operation');
  } catch (err) {
    return res.status(400).json({
      message: 'Bad request',
    });
  }
};
export default {
  signup,
  activate,
  sendResetLink,
  changePassword,
};
