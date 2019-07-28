import SequelizeSlugify from 'sequelize-slugify';

module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    'Article',
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      slug: DataTypes.STRING,
      body: DataTypes.TEXT,
      reads: DataTypes.INTEGER,
      image: DataTypes.STRING,
      rating: DataTypes.FLOAT,
      readTime: DataTypes.STRING,
      flagged: DataTypes.BOOLEAN,
      categoryId: DataTypes.INTEGER,
      audiourl: DataTypes.STRING,
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

    Article.belongsToMany(models.Tag, {
      through: 'ArticleTag',
      foreignKey: 'articleId',
      as: 'tags'
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

    Article.hasMany(models.Bookmark, {
      foreignKey: 'articleId',
      as: 'bookmarks',
      cascade: true,
    });

    Article.hasMany(models.Comment, {
      foreignKey: 'articleId',
      as: 'comment',
      cascade: true
    });
    Article.hasMany(models.Report, {
      foreignKey: 'articleId',
      as: 'reports',
      cascade: true
    });
    Article.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
  };
  return Article;
};
