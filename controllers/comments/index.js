import db from '../../db/models';

export default {
  addComment: async (req, res) => {
    const { params: { slug }, body: { content }, user } = req;
    try {
      const foundArticle = await db.Article.findOne({
        where: { slug }
      });
      if (!foundArticle) {
        return res.status(404).send({
          error: 'Article does not exist'
        });
      }
      const comment = await db.Comment.create({
        articleId: foundArticle.id,
        userId: user.id,
        content
      });
      return res.status(201).json({
        message: 'Comment added successfully',
        comment
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'something went wrong'
      });
    }
  },

  editComment: async (req, res) => {
    const { params: { slug, commentId }, body: { content } } = req;
    try {
      const foundArticle = await db.Article.findOne({
        where: { slug }
      });
      if (!foundArticle) {
        return res.status(404).send({
          error: 'Article does not exist'
        });
      }

      const foundComment = await db.Comment.findOne({
        where: { id: commentId }
      });
      if (!foundComment) {
        return res.status(404).send({
          error: 'Comment does not exist'
        });
      }
      await db.CommentHistory.create({
        commentId,
        content: foundComment.content
      });

      const editedComment = await foundComment.update({ content });

      return res.status(200).send({
        comment: editedComment
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: 'Something went wrong',
      });
    }
  },

  getCommentHistory: async (req, res) => {
    const { params: { slug, commentId }, query } = req;
    const limit = query.limit || 20;
    const offset = query.offset ? (query.offset * limit) : 0;

    try {
      const article = await db.Article.findOne({
        where: { slug }
      });

      if (!article) {
        return res.status(404).send({
          error: 'Article does not exist'
        });
      }

      const comment = await db.Comment.findOne({
        where: { id: commentId },
        attributes: ['id', 'articleId', 'content', 'updatedAt']
      });

      if (!comment) {
        return res.status(404).send({
          error: 'Comment does not exist'
        });
      }

      const commentHistory = await db.CommentHistory.findAndCountAll({
        offset,
        limit,
        where: {
          commentId
        },
        attributes: ['content', 'createdAt']
      });

      return res.status(200).send({
        comment,
        commentHistory: commentHistory.rows,
        commentHistorycount: commentHistory.count
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: e.message
      });
    }
  }
};
