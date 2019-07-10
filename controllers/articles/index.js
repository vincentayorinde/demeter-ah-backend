import { uploadImage, deleteImage } from '../../utils';
import db from '../../db/models';

export default {
  getArticle: async (req, res) => {
    try {
      const article = await db.Article.findOne({
        where: { slug: req.params.slug },
        include: [{
          model: db.User,
          as: 'author',
          attributes: ['username', 'bio', 'image']
        }]
      });

      if (!article) {
        return res.status(404).send({
          message: 'Article not found',
        });
      }

      return res.status(200).json({
        article
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message,
      });
    }
  },

  createArticle: async (req, res) => {
    try {
      const data = req.body;
      const { user } = req;

      let article = await user.createArticle(
        {
          description: data.description,
          body: data.body,
          title: data.title
        }
      );

      if (req.files) {
        const image = await uploadImage(req.files.image, article.slug);
        article = await article.update({ image });
      }

      article.setDataValue('author', {
        username: user.username,
        bio: user.bio,
        image: user.image
      });

      return res.status(201).json({
        message: 'Article Created Successfully',
        article
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message,
      });
    }
  },

  updateArticle: async (req, res) => {
    try {
      const data = { ...req.body, ...req.params };
      const { user } = req;

      const foundArticle = await db.Article.findOne({
        where: { slug: data.slug },
        include: [{
          model: db.User,
          as: 'author',
          attributes: ['username', 'bio', 'image']
        }]
      });

      if (!foundArticle) {
        return res.status(404).send({
          message: 'Article not found',
        });
      }
      if (foundArticle.userId !== user.id) {
        return res.status(401).send({
          message: 'You are not Authorized to edit this Article',
        });
      }

      data.image = req.files
        ? await uploadImage(req.files.image, foundArticle.slug)
        : foundArticle.image;

      const article = await foundArticle.update({
        description: data.description || foundArticle.description,
        body: data.body || foundArticle.body,
        title: data.title || foundArticle.title,
        image: data.image || foundArticle.image,
      });

      return res.status(200).json({
        message: 'Article Updated Successfully',
        article
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message,
      });
    }
  },
  rateArticle: async (req, res) => {
    const { params: { slug }, body: { rate }, user } = req;
    try {
      const foundArticle = await db.Article.findOne({
        where: { slug }
      });
      if (!foundArticle) {
        return res.status(404).json({
          message: 'Article does not exist'
        });
      }
      const checkRating = await db.Ratings.findOne({
        where: {
          userId: user.id,
          articleId: foundArticle.id
        }
      });
      if (checkRating) {
        checkRating.update({
          stars: rate
        });
        return res.status(200).json({
          message: 'Rating updated successfully'
        });
      }
      const rating = await user.createRate({
        articleId: foundArticle.id,
        stars: rate
      });
      return res.status(201).json({
        message: 'Article rated successfully',
        rating,
      });
    } catch (e) {
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message
      });
    }
  },
  deleteArticle: async (req, res) => {
    try {
      const data = { ...req.params };
      const { user } = req;

      const article = await db.Article.findOne({
        where: { slug: data.slug },
        include: [{
          model: db.User,
          as: 'author',
          attributes: ['username', 'bio', 'image']
        }]
      });

      if (!article) {
        return res.status(404).send({
          message: 'Article not found',
        });
      }

      if (article.userId !== user.id) {
        return res.status(401).send({
          message: 'You are not Authorized to delete this Article',
        });
      }

      await article.destroy();
      await deleteImage(article.slug);

      return res.status(200).json({
        message: 'Article Deleted Successfully',
        article,
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message,
      });
    }
  }
};
