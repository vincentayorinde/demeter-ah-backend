module.exports = (sequelize, DataTypes) => {
  const CommentVote = sequelize.define('CommentVote', {
    status: DataTypes.BOOLEAN
  }, {});
  CommentVote.associate = (models) => {
    CommentVote.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    CommentVote.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'userDownVote'
    });
    CommentVote.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'userUpVote'
    });
    CommentVote.belongsTo(models.Comment, {
      foreignKey: 'commentId',
      as: 'comment'
    });
  };

  CommentVote.getCommentVotes = (data) => {
    const { commentId, status } = data;
    return CommentVote.count({
      where: {
        commentId,
        status
      }
    });
  };

  CommentVote.findCommentVote = (data) => {
    const { userId, commentId } = data;
    return CommentVote.findOne({
      where: {
        userId,
        commentId
      }
    });
  };

  CommentVote.prototype.updateCommentVote = function update(status) {
    return this.update({
      status
    });
  };

  CommentVote.prototype.deleteCommentVote = function deleteVote() {
    return this.destroy();
  };

  return CommentVote;
};
