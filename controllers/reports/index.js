import db from '../../db/models';

export default {
  reportArticle: async (req, res) => {
    const {
      user, body: {
        articleId, message
      }
    } = req;

    const articleExist = await db.Article.findOne({
      where: {
        id: articleId
      }
    });

    if (!articleExist) {
      return res.status(404).send({
        message: 'Article does not exist'
      });
    }

    await db.Report.create({
      articleId,
      userId: user.id,
      message,
    });

    return res.status(200).send({
      message: 'thank you for the report'
    });
  },

  getReportedArticles: async (req, res) => {
    const articles = await db.Report.findAll({
      include: [
        {
          model: db.Article,
          as: 'articles'
        },
        {
          model: db.User,
          as: 'reporter',
          attributes: ['firstName', 'lastName', 'email', 'image', 'id', 'username']
        },
      ],

    });

    return res.status(200).send({
      articles
    });
  }
};
