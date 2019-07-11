module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Users', 'emailNotify', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    })
    .then(() => queryInterface.addColumn('Users', 'inAppNotify', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    })),
  down: queryInterface => queryInterface.removeColumn('Users', 'emailNotify').then(() => queryInterface.removeColumn('Users', 'inAppNotify')),
};
