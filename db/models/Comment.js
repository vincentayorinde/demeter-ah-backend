

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, {});
  Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Comment.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article',
      cascade: true
    });
  };
  return Comment;
};
