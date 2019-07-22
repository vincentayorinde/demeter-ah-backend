import db from '../../db/models';
import Notification from '../../utils/notifications';

export default {
  addComment: async (req, res) => {
    const { params: { slug }, body: { content }, user } = req;
    let { highlightedTextObj } = req.body;
    try {
      const foundArticle = await db.Article.findOne({
        where: { slug },
      });
      if (!foundArticle) {
        return res.status(404).send({
          error: 'Article does not exist'
        });
      }
      highlightedTextObj = JSON.stringify(highlightedTextObj);
      const comment = await db.Comment.create({
        articleId: foundArticle.id,
        userId: user.id,
        content,
        highlightedText: highlightedTextObj
      });

      Notification.articleNotification({
        articleId: foundArticle.id,
        userId: user.id,
        type: 'comment'
      });
      return res.status(201).json({
        message: 'Comment added successfully',
        comment
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: 'something went wrong'
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
  },
  voteComment: async (req, res) => {
    const { params: { commentId }, body, user } = req;
    const comment = await db.Comment.findOne({
      where: {
        id: commentId
      }
    });

    const status = JSON.parse(body.status);

    try {
      if (!comment) {
        return res.status(404).send({
          error: 'This comment does not exist'
        });
      }

      const voteDetails = {
        userId: user.id,
        commentId,
        status
      };

      const vote = await db.CommentVote.findCommentVote(voteDetails);

      let resStatus = 201;
      let message = status ? 'You upvote this comment' : 'You downvote this comment';

      if (!vote) {
        await db.CommentVote.create(voteDetails);
      } else {
        resStatus = 200;
        if (status === vote.status) {
          await vote.deleteCommentVote();
          message = 'You have unvoted this comment';
        } else {
          await vote.updateCommentVote(status);
        }
      }

      const upvotes = await db.CommentVote.getCommentVotes({ ...voteDetails, status: true });
      const downvotes = await db.CommentVote.getCommentVotes({ ...voteDetails, status: false });

      return res.status(resStatus).json({
        message,
        upvotes,
        downvotes
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: 'Something went wrong',
      });
    }
  },

  getComments: async (req, res) => {
    const { params: { slug } } = req;
    try {
      const article = await db.Article.findOne({
        where: { slug }
      });

      if (!article) {
        return res.status(404).send({
          error: 'Article does not exist'
        });
      }
      const comments = await db.Comment.findAll({
        where: { articleId: article.id },
        include: [
          {
            model: db.CommentVote,
            where: { status: true },
            required: false,
            as: 'upVote',
            attributes: ['status'],
          },
          {
            model: db.CommentVote,
            where: { status: false },
            required: false,
            as: 'downVote',
            attributes: ['status'],
          }
        ],
      });
      return res.status(200).send({
        message: 'Comments retrieved successfully',
        comments,
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: 'Something went wrong',
      });
    }
  },
};
