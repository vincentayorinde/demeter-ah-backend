module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'social', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }),
  down: queryInterface => queryInterface
    .removeColumn('Users', 'social')
    .then(() => queryInterface.removeColumn('Users', 'social'))
};
