module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('MemberShips', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    followerId: {
      type: Sequelize.INTEGER,
      required: true,
      references: {
        model: 'Users',
        key: 'id',
        as: 'follower'
      }
    },
    followId: {
      type: Sequelize.INTEGER,
      required: true,
      references: {
        model: 'Users',
        key: 'id',
        as: 'followed'
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
  down: queryInterface => queryInterface.dropTable('MemberShips')
};
