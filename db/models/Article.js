import SequelizeSlugify from 'sequelize-slugify';

module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    'Article',
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      slug: DataTypes.STRING,
      body: DataTypes.TEXT,
      image: DataTypes.STRING,
      rating: DataTypes.FLOAT
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
      foreignKey: 'authorId',
      as: 'author',
    });

    Article.hasMany(models.ArticleVote, {
      foreignKey: 'articleId',
      as: 'articleVote',
      cascade: true
    });

    Article.hasMany(models.ArticleTag, {
      foreignKey: 'articleId',
      as: 'articleTag',
      cascade: true
    });
  };

  return Article;
};
