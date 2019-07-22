module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Articles', 'categoryId', {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: null,
  }),
  down: queryInterface => queryInterface.removeColumn('Articles', 'categoryId')
};
