import { sanitize } from 'indicative';
import { messages, validatorInstance, sanitizeRules } from '../../utils';

export default {
  changeRole: async (req, res, next) => {
    const rules = {
      role: 'required|string|in:author,admin'
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
};
