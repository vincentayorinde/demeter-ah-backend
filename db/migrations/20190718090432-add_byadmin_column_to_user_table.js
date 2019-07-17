module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Users', 'byadmin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }),
  down: queryInterface => Promise.all([
    queryInterface.removeColumn('Users', 'byadmin')
  ])
};
