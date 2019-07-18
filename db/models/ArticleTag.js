module.exports = (sequelize) => {
  const ArticleTag = sequelize.define('ArticleTag', {
  }, {});
  ArticleTag.associate = (models) => {
    ArticleTag.belongsTo(models.Article, {
      foreignKey: 'articleId'
    });

    ArticleTag.belongsTo(models.Tag, {
      foreignKey: 'tagId'
    });
  };
  return ArticleTag;
};
