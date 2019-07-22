module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Users', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }),
  down: queryInterface => Promise.all([
    queryInterface.removeColumn('Users', 'active')
  ])
};
