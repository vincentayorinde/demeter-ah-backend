module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    message: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER
  }, {});
  Report.associate = (models) => {
    Report.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'articles'
    });

    Report.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'reporter'
    });
  };
  return Report;
};
