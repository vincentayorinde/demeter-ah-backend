module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Articles', 'audiourl', {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
  }),
  down: queryInterface => queryInterface.removeColumn('Articles', 'audiourl')
};
