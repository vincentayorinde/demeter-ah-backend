import db from '../../db/models';
import { blackListThisToken, getToken } from '../../utils';

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
        username
      });
      user.response.token = getToken(user.id, user.email);
      return res.status(201).json({
        message: 'User Registration successful',
        user: user.response()
      });
    } catch (e) {
      return res.status(500).json({
        message: 'Something went wrong'
      });
    }
  },

  logIn: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await db.User.findOne({
        where: { email }
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
      return res.status(200).json({
        message: 'User Login in successful',
        user: user.response()
      });
    } catch (e) {
      return res.status(500).json({
        message: 'Something went wrong'
      });
    }
  },

  signOut: async (req, res) => {
    const token = req.headers['x-access-token'];
    await blackListThisToken(token);
    return res.status(200).send({
      message: 'Thank you'
    });
  }
};
