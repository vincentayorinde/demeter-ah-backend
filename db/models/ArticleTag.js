module.exports = (sequelize) => {
  const ArticleTag = sequelize.define('ArticleTag', {
  }, {});
  ArticleTag.associate = (models) => {
    ArticleTag.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article'
    });

    ArticleTag.belongsTo(models.Tag, {
      foreignKey: 'tagId',
      as: 'tag'
    });
  };
  return ArticleTag;
};
