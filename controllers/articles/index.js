import { decodeToken } from '../../utils';
import db from '../../db/models';

export default {
  createArticle: async (req, res) => {
    const {
      description, body, title, image
    } = req.body;
    try {
      const article = await req.user.createArticle({
        description,
        body,
        title,
        images: image || 'defaultImgUrl',
      });

      return res.status(201).json({
        message: 'Article created successful',
        article,
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
    const token = req.headers['x-access-token'];
    const decodedToken = decodeToken(token);
    const { articleId } = req.params;
    const { rate } = req.body;
    const { id } = decodedToken;
    try {
      const checkRating = await db.Ratings.findOne({
        where: {
          userId: id,
          articleId
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
      const rating = await req.user.createRate({
        articleId,
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
  }
};
