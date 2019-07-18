module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: DataTypes.STRING
  }, {});
  Tag.associate = (models) => {
    Tag.hasMany(models.ArticleTag, {
      foreignKey: 'tagId',
      as: 'articleTag',
      cascade: true
    });
    Tag.belongsToMany(models.Article, { through: 'ArticleTag', foreignKey: 'tagId', as: 'article' });
  };
  return Tag;
};
