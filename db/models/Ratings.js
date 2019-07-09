
module.exports = (sequelize, DataTypes) => {
  const Ratings = sequelize.define('Ratings', {
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER,
    stars: DataTypes.INTEGER
  }, {});
  Ratings.associate = (models) => {
    Ratings.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Ratings.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article',
      cascade: true
    });
  };
  return Ratings;
};
