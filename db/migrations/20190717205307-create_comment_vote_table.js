module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('CommentVotes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: {
      type: Sequelize.INTEGER,
      required: true,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'user',
      },
    },
    commentId: {
      type: Sequelize.INTEGER,
      required: true,
      onDelete: 'CASCADE',
      references: {
        model: 'Comments',
        key: 'id',
        as: 'comments',
      },
    },
    status: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      required: true
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
  down: queryInterface => queryInterface.dropTable('CommentVotes')
};
