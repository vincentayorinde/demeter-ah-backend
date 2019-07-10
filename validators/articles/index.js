import { messages, validatorInstance } from '../../utils';

export default {
  createArticle: async (req, res, next) => {
    const rules = {
      description: 'required|string',
      body: 'required|string',
      image: 'object',
      title: 'required|string',
    };

    const data = { ...req.body, ...req.files };

    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      return res.status(400).json({
        message: e,
      });
    }
  },

  updateArticle: async (req, res, next) => {
    const rules = {
      description: 'string',
      body: 'string',
      image: 'object',
      title: 'string',
      slug: 'string|required'
    };

    const data = { ...req.body, ...req.files, ...req.params };

    try {
      await validatorInstance.validateAll(data, rules, messages);
      next();
    } catch (e) {
      return res.status(400).json({
        message: e,
      });
    }
  },

  articleSlug: async (req, res, next) => {
    const rules = {
      slug: 'string|required'
    };

    const data = { ...req.params };

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
