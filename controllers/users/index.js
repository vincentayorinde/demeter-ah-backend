import Sequelize from 'sequelize';
import db from '../../db/models';
import {
  blackListThisToken, randomString, hashPassword, uploadImage
} from '../../utils';
import { sendMail } from '../../utils/mailer';
import { resetPasswordMessage } from '../../utils/mailer/mails';

export default {
  signUp: async (req, res) => {
    const {
      firstName, lastName, password, email, username
    } = req.body;

    const newEmail = email.toLowerCase();
    const newUsername = username.toLowerCase();

    try {
      const user = await db.User.create({
        firstName,
        lastName,
        password,
        email: newEmail,
        username: newUsername
      });
      return res.status(201).json({
        message: 'User Registration successful',
        user: { ...user.response(), followersNo: 0, followingNo: 0 }
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        error: 'Something went wrong'
      });
    }
  },

  logIn: async (req, res) => {
    const { email, password } = req.body;
    const newEmail = email.toLowerCase();
    try {
      const user = await db.User.findOne({
        where: { email: newEmail }
      });


      if (!user) {
        return res.status(400).send({
          error: 'Invalid email or password'
        });
      }
      const isPasswordValid = await user.passwordsMatch(password);
      if (!isPasswordValid) {
        return res.status(400).send({
          error: 'Invalid email or password'
        });
      }

      const followingNo = await db.MemberShip.count({
        where: { followerId: user.id },
      });

      const followersNo = await db.MemberShip.count({
        where: { followId: user.id },
      });

      return res.status(200).json({
        message: 'User Login in successful',
        user: { ...user.response(), followingNo, followersNo }
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong'
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      let username = req.body.username || req.user.username;
      username = username.toLowerCase();
      const image = req.files
        ? await uploadImage(req.files.image, `${username}-profileImg`)
        : req.user.image;

      if (req.body.username) {
        const foundUser = await db.User.findOne({
          where: { username: req.body.username }
        });
        if (foundUser) {
          if (foundUser.id !== req.user.id) {
            return res.status(400).json({
              message: 'Username already exist'
            });
          }
        }
      }

      const user = await req.user.update(
        {
          username,
          firstName: req.body.firstName || req.user.firstName,
          lastName: req.body.lastName || req.user.lastName,
          image,
          bio: req.body.bio || req.user.bio
        }
      );

      const followingNo = await db.MemberShip.count({
        where: { followerId: user.id },
      });

      const followersNo = await db.MemberShip.count({
        where: { followId: user.id },
      });

      res.status(200).json({
        message: 'User profile successfully updated',
        user: { ...user.response(), followersNo, followingNo }
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong'
      });
    }
  },

  signOut: async (req, res) => {
    const token = req.headers['x-access-token'];
    await blackListThisToken(token);
    return res.status(200).send({
      message: 'Signed out successfully'
    });
  },
  resetPassword: async (req, res) => {
    let { email } = req.body;
    email = email.toLowerCase();
    try {
      const user = await db.User.findOne({ where: { email } });
      if (user) {
        const passwordResetToken = randomString();
        const date = new Date();
        date.setHours(date.getHours() + 2);
        await user.update({ passwordResetToken, passwordResetExpire: date });
        sendMail({
          email: user.email,
          subject: 'Password Reset LInk',
          content: resetPasswordMessage(user, passwordResetToken)
        });

        return res.status(200).json({
          message: 'Password reset successful. Check your email for password reset link!'
        });
      }

      return res.status(400).json({
        message: 'User does not exist'
      });
    } catch (err) {
      /* istanbul ignore next */
      return res.status(400).json({
        message: 'Something went wrong'
      });
    }
  },

  activate: async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: { emailVerificationToken: req.params.token, activated: false }
      });
      if (user) {
        await user.update({ activated: true, emailVerificationToken: null });
        return res.status(200).json({
          message: 'Activation successful, You can now login',
          user: user.response()
        });
      }
      return res.status(400).json({
        error: 'Invalid activation Link'
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(400).json({
        message: 'Bad request'
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
            [Op.gt]: new Date()
          }
        }
      });
      if (user) {
        user.update({
          password: passwordHash,
          resetToken: null,
          resetExpire: null
        });
        return res.status(200).json({
          message: 'Password has successfully been changed.'
        });
      }
      return res.status(401).json({
        error: 'Invalid operation'
      });
    } catch (err) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong'
      });
    }
  },

  getNotificationStatus: async (req, res) => {
    const { user: { emailNotify, inAppNotify } } = req;
    return res.status(200).send({
      notificationStatus: {
        emailNotify, inAppNotify
      }
    });
  },

  changeEmailNotification: async (req, res) => {
    const { user } = req;
    const notifyMe = user.emailNotify;
    const result = await user.update({
      emailNotify: !notifyMe,
    });
    const { emailNotify, inAppNotify } = result;
    return res.status(200).send({
      notificationStatus: {
        emailNotify, inAppNotify
      }
    });
  },

  changeInAppNotification: async (req, res) => {
    const { user } = req;
    const notifyMe = user.inAppNotify;
    const result = await user.update({
      inAppNotify: !notifyMe,
    });

    const { emailNotify, inAppNotify } = result;
    return res.status(200).send({
      notificationStatus: {
        emailNotify, inAppNotify
      }
    });
  },

  getNotifications: async (req, res) => {
    const { id } = req.user;

    const notifications = await db.Notification.findAll({
      where: {
        receiverId: id,
      },
      order: [
        ['createdAt', 'DESC']
      ]
    });

    return res.status(200).send({
      notifications
    });
  },

  readNotification: async (req, res) => {
    const { id } = req.user;

    const notifyId = req.params.id;
    let notification = await db.Notification.findOne({
      where: {
        receiverId: id,
        id: notifyId,
      }
    });
    if (notification) {
      const { seen } = notification;
      if (!seen) {
        notification = await notification.update({
          seen: true
        });
      }
      return res.status(200).send({
        notification
      });
    }
    return res.status(404).send({
      error: 'Notification not Found'
    });
  },

  getUsers: async (req, res) => {
    try {
      const { query } = req;
      const limit = query.limit || 20;
      const offset = query.offset ? (query.offset * limit) : 0;

      const users = await db.User.findAndCountAll({
        offset,
        limit,
        attributes: ['username', 'firstName', 'lastName', 'image']
      });
      return res.status(200).json({
        users: users.rows,
        usersCount: users.count
      });
    } catch (e) {
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message,
      });
    }
  },

  adminUpdate: async (req, res) => {
    let { username } = req.params;
    username = username.toLowerCase();
    try {
      const foundUser = await db.User.findOne({
        where: {
          username
        }
      });

      if (!foundUser) {
        return res.status(404).send({
          error: 'User does not exist'
        });
      }
      username = req.body.username || foundUser.username;
      username = username.toLowerCase();
      const image = req.files
        ? await uploadImage(req.files.image, `${username}-profileImg`)
        : foundUser.image;

      const { firstName, lastName, bio } = req.body || foundUser;
      const user = await foundUser.update(
        {
          username,
          firstName,
          lastName,
          image,
          bio
        }
      );
      res.status(200).send({
        user: user.response()
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: 'Something went wrong'
      });
    }
  },

  adminDelete: async (req, res) => {
    let { username } = req.params;
    username = username.toLowerCase();

    const foundUser = await db.User.findOne({
      where: {
        username
      }
    });
    try {
      if (!foundUser) {
        return res.status(404).send({
          error: 'User does not exist'
        });
      }

      await foundUser.update({
        active: false
      });

      res.status(200).send({
        message: 'User profile deactivated successfully'
      });
    } catch (e) {
    /* istanbul ignore next */
      return res.status(500).send({
        error: 'Something went wrong'
      });
    }
  },

  adminCreate: async (req, res) => {
    const {
      firstName, lastName, email, username, role
    } = req.body;

    const newEmail = email.toLowerCase();
    const newUsername = username.toLowerCase();
    const password = randomString();
    try {
      const user = await db.User.create({
        firstName,
        lastName,
        password,
        email: newEmail,
        username: newUsername,
        role,
        byadmin: true
      });
      return res.status(201).json({
        user: user.response()
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        error: 'Something went wrong'
      });
    }
  },
};
