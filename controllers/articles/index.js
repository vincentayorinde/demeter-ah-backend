import {
  uploadImage, deleteImage, findRatedArticle, storeRating
} from '../../utils';
import db from '../../db/models';
import Notification from '../../utils/notifications';
import textToSpeech from '../../middlewares/AWS';

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
          model: db.Tag,
          as: 'tags',
          attributes: ['name']
        }]
      });

      if (!article) {
        return res.status(404).send({
          message: 'Article does not exist',
        });
      }
      return res.status(200).send({
        article
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        error: 'Something went wrong'
      });
    }
  },

  createArticle: async (req, res) => {
    try {
      const {
        user, body: {
          description, body, title, tags, readTime, categoryId
        }
      } = req;

      const categoryExist = await db.Category.findOne({
        where: {
          id: categoryId
        }
      });

      if (!categoryExist) {
        return res.status(400).send({
          message: 'category does not Exist'
        });
      }

      const tagDetails = tags ? tags.split(',') : null;
      const tagList = [];
      let article = await user.createArticle(
        {
          description,
          body,
          title,
          readTime,
          categoryId
        }
      );

      textToSpeech(article.id, article.body, article.slug);

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
        readTime: data.readTime || foundArticle.readTime,
        categoryId: data.categoryId || foundArticle.categoryId,
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
        await storeRating(foundArticle.id);
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
      /* istanbul ignore next */
      return res.status(500).json({
        error: 'Something went wrong',
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
    status = JSON.parse(status);
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
        resStatus = 200;
        if (status === vote.status) {
          await vote.deleteArticleVote();
          message = 'You have unvote this article';
        } else {
          await vote.updateArticleVote(status);
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
    const { query } = req;
    const offset = query.offset ? (query.offset * query.limit) : 0;
    const limit = query.limit || 20;

    try {
      const foundArticle = await findRatedArticle({
        where: { slug: req.params.slug }
      });
      if (!foundArticle) {
        return res.status(404).json({
          message: 'Article does not exist'
        });
      }
      const fetchRating = await db.Ratings.findAndCountAll({
        offset,
        limit,
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
        totalRates: fetchRating.rows.length,
        rates: fetchRating.rows,
        count: fetchRating.count
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message
      });
    }
  },

  bookmarkArticle: async (req, res) => {
    const { params: { slug }, user } = req;
    try {
      const article = await db.Article.findOne({
        where: { slug }
      });
      if (!article) {
        return res.status(404).send({
          error: 'Article does not exist'
        });
      }

      const foundBookmark = await db.Bookmark.findOne({
        where: {
          articleId: article.id,
          userId: user.id
        }
      });

      if (foundBookmark) {
        foundBookmark.destroy();
        return res.status(200).send({
          message: 'Bookmark successfully removed'
        });
      }

      const bookmark = await db.Bookmark.create({
        articleId: article.id,
        userId: user.id
      });

      return res.status(201).send({
        message: 'Bookmark created successfully',
        bookmark
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: 'Something went wrong',
      });
    }
  },

  flagArticle: async (req, res) => {
    const { params: { slug }, body: { flag } } = req;

    const article = await db.Article.findOne({
      where: { slug }
    });
    if (!article) {
      return res.status(404).send({
        message: 'Article does not exist'
      });
    }
    const result = await article.update({
      flagged: JSON.parse(flag)
    });

    return res.status(200).send({
      article: result
    });
  },

  showArticleReports: async (req, res) => {
    const { params: { slug } } = req;

    const article = await db.Article.findOne({
      where: { slug },
      include: [{
        model: db.Report,
        as: 'reports',
        include: [{
          model: db.User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName', 'email', 'image', 'username']
        }]
      }]
    });

    if (!article) {
      return res.status(404).send({
        message: 'Article does not exist'
      });
    }
    return res.status(200).send({
      article,
    });
  },

  deleteReportedArticle: async (req, res) => {
    const { params: { slug } } = req;

    const article = await db.Article.findOne({
      where: {
        slug
      }
    });
    if (!article) {
      return res.status(404).send({
        message: 'Article does not exist'
      });
    }
    const reports = await db.Report.findAll({
      where: {
        articleId: article.id
      }
    });
    if (!reports.length) {
      return res.status(404).send({
        message: 'sorry you can\'t delete an article that was not reported'
      });
    }

    await deleteImage(article.slug);
    await db.Article.destroy({
      where: {
        id: article.id,
      }
    });
    return res.status(200).send({
      message: 'deleted successfully',
    });
  },

  statsUpdate: async (req, res) => {
    try {
      const { params: { slug } } = req;
      const article = await db.Article.findOne({
        where: { slug }
      });

      if (!article) {
        return res.status(404).send({
          error: 'Article deos not exist',
        });
      }

      await article.increment(['reads'], { by: 1 });
      return res.status(200).send({
        message: 'Article reads successfully Incremented',
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: 'Something went wrong'
      });
    }
  }
};
