module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
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

    Comment.hasMany(models.CommentHistory, {
      foreignKey: 'commentId',
      as: 'commentHistory',
      cascade: true
    });
  };
  return Comment;
};
