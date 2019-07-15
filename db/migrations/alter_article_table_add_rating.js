module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Articles', 'rating', {
      type: Sequelize.FLOAT,
      allowNull: true,
    }),
  down: queryInterface => queryInterface.removeColumn('Articles', 'rating'),
};
