import Sequelize from 'sequelize';
import db from '../../db/models';
import {
  blackListThisToken, randomString, hashPassword, getToken
} from '../../utils';
import { sendMail } from '../../utils/mailer';
import htmlMessage from '../../utils/mailer/mails';

export default {
  signUp: async (req, res) => {
    const {
      firstName, lastName, password, email, username
    } = req.body;
    try {
      const user = await db.User.create({
        firstName,
        lastName,
        password,
        email,
        username,
      });
      user.response.token = getToken(user.id, user.email);
      return res.status(201).json({
        message: 'User Registration successful',
        user: user.response(),
      });
    } catch (e) {
      return res.status(500).json({
        message: 'Something went wrong',
      });
    }
  },

  logIn: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await db.User.findOne({
        where: { email },
      });
      if (!user) {
        return res.status(400).send({
          error: 'Invalid email or password',
        });
      }
      const isPasswordValid = await user.passwordsMatch(password);
      if (!isPasswordValid) {
        return res.status(400).send({
          error: 'Invalid email or password',
        });
      }
      return res.status(200).json({
        message: 'User Login in successful',
        user: user.response(),
      });
    } catch (e) {
      return res.status(500).json({
        message: 'Something went wrong',
      });
    }
  },

  signOut: async (req, res) => {
    const token = req.headers['x-access-token'];
    await blackListThisToken(token);
    return res.status(200).send({
      message: 'Thank you',
    });
  },
  resetPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await db.User.findOne({ where: { email } });
      if (user) {
        const passwordResetToken = randomString();
        const date = new Date();
        date.setHours(date.getHours() + 2);
        user.update({ passwordResetToken, passwordResetExpire: date });
        await sendMail({
          email: user.email,
          subject: 'Password Reset LInk',
          content: htmlMessage(user.email, passwordResetToken),
        });
        return res.status(200).json({
          message: 'Password reset successful. Check your email for password reset link!',
        });
      }
      throw new Error('User not found');
    } catch (err) {
      return res.status(400).json({
        message: 'User does not exist',
      });
    }
  },

  changePassword: async (req, res) => {
    const { password } = req.body;
    const { Op } = Sequelize;

    const passwordHash = await hashPassword(password);

    const { resetToken } = req.query;
    try {
      const user = await db.User.findOne({
        where: {
          passwordResetToken: resetToken,
          passwordResetExpire: {
            [Op.gt]: new Date(),
          },
        },
      });
      if (user) {
        user.update({ password: passwordHash, resetToken: null, resetExpire: null });
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
  },
};
