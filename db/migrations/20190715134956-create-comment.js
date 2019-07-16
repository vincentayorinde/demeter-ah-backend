
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Comments', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: {
      type: Sequelize.INTEGER,
      required: true,
      references: {
        model: 'Users',
        key: 'id',
        as: 'user'
      }
    },
    articleId: {
      type: Sequelize.INTEGER,
      required: true,
      references: {
        model: 'Articles',
        key: 'id',
        as: 'article'
      }
    },
    content: {
      allowNull: false,
      type: Sequelize.TEXT
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
  down: queryInterface => queryInterface.dropTable('Comments')
};
