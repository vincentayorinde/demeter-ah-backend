module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('CommentHistories', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    commentId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Comments',
        key: 'id',
        as: 'comment'
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
  down: queryInterface => queryInterface.dropTable('CommentHistories')
};
