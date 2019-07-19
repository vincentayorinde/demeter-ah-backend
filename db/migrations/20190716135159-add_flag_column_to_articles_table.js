module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Articles', 'flagged', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }),
  down: queryInterface => queryInterface.removeColumn('Articles', 'flagged'),
};
