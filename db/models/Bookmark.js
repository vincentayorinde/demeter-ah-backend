
module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER,
  }, {});
  Bookmark.associate = (models) => {
    Bookmark.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Bookmark.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article',
    });
  };
  return Bookmark;
};
