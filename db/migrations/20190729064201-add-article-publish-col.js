module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Articles', 'publish', {
    type: Sequelize.BOOLEAN
  }),
  down: queryInterface => queryInterface.removeColumn('Articles', 'publish')
};
