module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: DataTypes.TEXT
  }, {});
  Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
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

    Comment.hasMany(models.CommentVote, {
      foreignKey: 'commentId',
      as: 'upVote',
      cascade: true
    });
    Comment.hasMany(models.CommentVote, {
      foreignKey: 'commentId',
      as: 'downVote',
      cascade: true
    });
  };
  return Comment;
};
