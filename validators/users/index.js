import { sanitize } from 'indicative';
import { messages, validatorInstance, sanitizeRules } from '../../utils';

export default {
  signUp: async (req, res, next) => {
    const rules = {
      firstName: 'required|alpha',
      lastName: 'required|alpha',
      username: 'required|alphaNumeric',
      email: 'required|email|unique:users',
      password: 'required|min:8|max:30',
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
        message: e,
      });
    }
  },
};
