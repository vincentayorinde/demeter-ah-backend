import { messages, validatorInstance } from '../../utils';

export default {
  createArticle: async (req, res, next) => {
    const rules = {
      description: 'required|string',
      body: 'required|string',
      image: 'string',
      title: 'required|string',
    };

    const data = req.body;

    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      return res.status(400).json({
        message: e,
      });
    }
  },
  rateArticle: async (req, res, next) => {
    const rule = {
      rate: 'required|integer|range:0,6',
    };
    try {
      await validatorInstance.validateAll(req.body.rate, rule, messages);
      next();
    } catch (e) {
      return res.status(400).json({
        message: e,
      });
    }
  }
};
