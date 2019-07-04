import SequelizeSlugify from 'sequelize-slugify';

module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    'Article',
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      slug: DataTypes.STRING,
      body: DataTypes.TEXT,
      images: DataTypes.STRING,
    },
    {}
  );

  SequelizeSlugify.slugifyModel(Article, {
    source: ['title'],
    slugOptions: { lower: true },
    overwrite: false,
    column: 'slug',
  });
  Article.associate = (models) => {
    Article.belongsTo(models.User, {
      foreginKey: 'userId',
      as: 'user',
    });
  };
  return Article;
};
