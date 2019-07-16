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
  }
};
