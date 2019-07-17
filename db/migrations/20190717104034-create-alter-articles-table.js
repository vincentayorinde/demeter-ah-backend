module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Articles', 'reads', {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  }),
  down: queryInterface => queryInterface.removeColumn('Articles', 'reads')
};
