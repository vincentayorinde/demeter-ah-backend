import {
  uploadImage, deleteImage, findRatedArticle, storeRating
} from '../../utils';
import db from '../../db/models';
import Notification from '../../utils/notifications';

export default {
  getArticles: async (req, res) => {
    try {
      const { query } = req;
      const queryParams = {};
      if (query.author) queryParams.author = query.author;

      const offset = query.offset ? (query.offset * query.limit) : 0;
      const limit = query.limit || 20;

      const articles = await db.Article.findAndCountAll(
        {
          offset,
          limit,
          where: queryParams,
          include: [{
            model: db.User,
            as: 'author',
            attributes: ['username', 'bio', 'image']
          }]
        }
      );
      return res.status(200).json({
        articles: articles.rows,
        articlesCount: articles.count,
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message,
      });
    }
  },

  getArticle: async (req, res) => {
    try {
      const article = await db.Article.findOne({
        where: { slug: req.params.slug },
        include: [{
          model: db.User,
          as: 'author',
          attributes: ['username', 'bio', 'image']
        }, {
          model: db.ArticleTag,
          as: 'articleTag',
          include: [{
            model: db.Tag,
            as: 'tag',
            attributes: ['name']
          }]
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
      const {
        user, body: {
          description, body, title, tags
        }
      } = req;
      const tagDetails = tags ? tags.split(',') : null;
      const tagList = [];
      let article = await user.createArticle(
        {
          description,
          body,
          title
        }
      );

      if (req.files) {
        const image = await uploadImage(req.files.image, article.slug);
        article = await article.update({ image });
      }
      if (tagDetails) {
        tagDetails.forEach(async (tag) => {
          tag = tag.trim().toLowerCase();
          const tagResponse = await db.Tag.findOne({
            where: {
              name: tag
            }
          });

          if (!tagResponse) {
            const newTag = await db.Tag.create({
              name: tag
            });
            tagList.push(newTag.name);
            await db.ArticleTag.create({ tagId: newTag.id, articleId: article.id });
          } else {
            await db.ArticleTag.create({ tagId: tagResponse.id, articleId: article.id });
            tagList.push(tagResponse.name);
          }
        });
      }

      article.setDataValue('author', {
        username: user.username,
        bio: user.bio,
        image: user.image,
      });

      article.setDataValue('tagList', tagList);

      await Notification.articleNotification({
        userId: req.user.id,
        articleId: article.id,
        type: 'publish'
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
      if (foundArticle.authorId !== user.id) {
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
          message: 'Rating updated successfully',
          rating: checkRating
        });
      }
      const rating = await user.createRate({
        articleId: foundArticle.id,
        stars: rate
      });
      await storeRating(foundArticle.id);
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

      if (article.authorId !== user.id) {
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
  },

  voteArticle: async (req, res) => {
    const { slug } = req.params;
    let { status } = req.body;
    status = status === 'true' || status === 'false' ? JSON.parse(status) : status;
    const article = await db.Article.findOne({
      where: {
        slug
      }
    });

    try {
      if (!article) {
        return res.status(404).json({
          error: 'This article does not exist'
        });
      }

      const articleId = article.id;
      const userId = req.user.id;
      const voteDetails = {
        userId,
        articleId,
        status
      };

      const vote = await db.ArticleVote.findArticleVote(voteDetails);

      let resStatus = 201;
      let message = status ? 'You upvote this article' : 'You downvote this article';


      if (!vote) {
        await db.ArticleVote.create(voteDetails);
      } else {
        switch (status) {
          case true:
          case false:
            await vote.updateArticleVote(status);
            resStatus = 200;
            break;
          default:
            await vote.deleteArticleVote();
            message = 'You have unvote this article';
            resStatus = 200;
        }
      }

      const upvotes = await db.ArticleVote.getArticleVotes({ ...voteDetails, status: true });
      const downvotes = await db.ArticleVote.getArticleVotes({ ...voteDetails, status: false });

      return res.status(resStatus).json({
        message,
        upvotes,
        downvotes
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        error: e.message,
      });
    }
  },
  getArticleRatings: async (req, res) => {
    try {
      const foundArticle = await findRatedArticle({
        where: { slug: req.params.slug }
      });
      if (!foundArticle) {
        return res.status(404).json({
          message: 'Article does not exist'
        });
      }
      const fetchRating = await db.Ratings.findAll({
        where: {
          articleId: foundArticle.id,
        },
        attributes: { exclude: ['userId'] },
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'image', 'firstName', 'lastName']
        },
        {
          model: db.Article,
          as: 'article',
          attributes: ['rating']
        }],
      });
      return res.status(200).json({
        message: 'All ratings for Article',
        totalRates: fetchRating.length,
        rates: fetchRating
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message
      });
    }
  }
};
