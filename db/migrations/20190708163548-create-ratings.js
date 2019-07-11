
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Ratings', {
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
    stars: {
      type: Sequelize.INTEGER,
      defaultValue: null,
      validate: { min: 0, max: 5 }
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()')
    }
  }),
  down: queryInterface => queryInterface.dropTable('Ratings')
};
