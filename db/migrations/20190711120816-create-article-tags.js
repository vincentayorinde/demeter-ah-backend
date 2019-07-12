module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ArticleTags', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    articleId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Articles',
        key: 'id',
        as: 'article'
      }
    },
    tagId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Tags',
        key: 'id',
        as: 'tag'
      }
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: queryInterface => queryInterface.dropTable('ArticleTags')
};
