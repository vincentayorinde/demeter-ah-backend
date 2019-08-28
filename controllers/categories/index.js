import db from '../../db/models';
import { uploadImage } from '../../utils';

export default {
  addCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      let image = '';

      const foundCategory = await db.Category.findOne({
        where: { name }
      });

      if (foundCategory) {
        return res.status(400).send({
          error: 'Category Already exist',
        });
      }

      let category = await db.Category.create({
        name,
        description,
        image,
      });

      if (req.files) {
        image = await uploadImage(req.files.image, `${name}-${category.id}`);
        category = category.update({
          image
        });
      }

      if (req.files) {
        image = await uploadImage(req.files.image, `${name}`);
      }

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
