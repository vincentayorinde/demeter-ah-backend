import { sanitize } from 'indicative';
import { messages, validatorInstance, sanitizeRules } from '../../utils';

export default {
  signUp: async (req, res, next) => {
    const rules = {
      firstName: 'required|alpha',
      lastName: 'required|alpha',
      username: 'required|alphaNumeric|unique:User',
      email: 'required|email|unique:User',
      password: 'required|min:8|max:30',
    };

    let data = req.body;
    const email = data.email.toLowerCase();
    const username = data.username.toLowerCase();
    data = {
      ...data,
      email,
      username
    };

    sanitize(data, sanitizeRules);
    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      return res.status(400).json({
        message: e,
      });
    }
  },

  logIn: async (req, res, next) => {
    const rules = {
      email: 'required|email',
      password: 'required',
    };

    const data = req.body;

    sanitize(data, sanitizeRules);
    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      return res.status(400).json({
        message: e,
      });
    }
  },

  resetPassword: async (req, res, next) => {
    const rules = {
      email: 'required|email',
    };
    const data = req.body;
    sanitize(data, sanitizeRules);
    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      return res.status(400).json({
        message: e,
      });
    }
  },

  changePassword: async (req, res, next) => {
    const rules = {
      password: 'required|string',
      resetToken: 'required|string',
    };
    const { resetToken } = req.query;
    const data = { ...req.body, resetToken };

    sanitize(data, sanitizeRules);
    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      return res.status(400).json({
        message: e
      });
    }
  },

  updateUser: async (req, res, next) => {
    const rules = {
      username: 'string',
      firstName: 'string',
      lastName: 'string',
      bio: 'string',
      image: 'object'
    };
    const data = { ...req.body, ...req.files };
    sanitize(data, sanitizeRules);
    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      /* istanbul ignore next */
      return res.status(400).json({
        message: e
      });
    }
  },

  createUser: async (req, res, next) => {
    const rules = {
      firstName: 'required|alpha',
      lastName: 'required|alpha',
      username: 'required|alphaNumeric|unique:User',
      email: 'required|email|unique:User',
      role: 'required|string|in:author,admin,superadmin'
    };
    let data = req.body;
    const email = data.email.toLowerCase();
    const username = data.username.toLowerCase();
    data = {
      ...data,
      email,
      username
    };
    sanitize(data, sanitizeRules);

    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      return res.status(400).send({
        message: e,
      });
    }
  },
};
