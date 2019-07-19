module.exports = (sequelize, DataTypes) => {
  const CommentHistory = sequelize.define('CommentHistory', {
    content: DataTypes.TEXT
  }, {});
  CommentHistory.associate = (models) => {
    CommentHistory.belongsTo(models.Comment, {
      foreignKey: 'commentId',
      as: 'comment'
    });
  };
  return CommentHistory;
};
