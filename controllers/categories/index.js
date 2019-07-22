import db from '../../db/models';

export default {
  addCategory: async (req, res) => {
    const { name } = req.body;

    try {
      await db.Category.create({
        name,
      });

      return res.status(200).send({
        message: 'category added successfully'
      });
    } catch (e) {
      return res.status(400).send({
        error: e.message,
      });
    }
  },

  getCategories: async (req, res) => {
    const categories = await db.Category.findAll();
    return res.status(200).send({
      categories,
    });
  }
};
