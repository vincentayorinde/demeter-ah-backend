module.exports = (sequelize, DataTypes) => {
  const ArticleVote = sequelize.define('ArticleVote', {
    status: DataTypes.BOOLEAN
  }, {});
  ArticleVote.associate = (models) => {
    ArticleVote.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    ArticleVote.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article'
    });
  };

  ArticleVote.getArticleVotes = (data) => {
    const { articleId, status } = data;
    return ArticleVote.count({
      where: {
        articleId,
        status
      }
    });
  };

  ArticleVote.findArticleVote = (data) => {
    const { userId, articleId } = data;
    return ArticleVote.findOne({
      where: {
        userId,
        articleId
      }
    });
  };

  ArticleVote.prototype.updateArticleVote = function update(status) {
    return this.update({
      status
    });
  };

  ArticleVote.prototype.deleteArticleVote = function deleteVote() {
    return this.destroy();
  };

  return ArticleVote;
};
