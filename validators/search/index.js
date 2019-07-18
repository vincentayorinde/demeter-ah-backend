import { sanitize } from 'indicative';
import { messages, validatorInstance, sanitizeRules } from '../../utils';

export default {
  search: async (req, res, next) => {
    const rules = {
      tag: 'string',
      author: 'string',
      title: 'string|requiredWithoutAll:tag,author'
    };

    const data = { ...req.query };

    sanitize(data, sanitizeRules);
    try {
      await validatorInstance.validateAll(data, rules, messages);
      req.search = [];
      next();
    } catch (e) {
      return res.status(400).json({
        message: e,
      });
    }
  }
};
