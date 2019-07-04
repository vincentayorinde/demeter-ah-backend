

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Users', 'emailVerificationToken', {
      type: Sequelize.STRING,
      allowNull: true
    })
    .then(() => queryInterface.addColumn('Users', 'activated', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })),
  down: queryInterface => queryInterface
    .removeColumn('Users', 'emailVerificationToken')
    .then(() => queryInterface.removeColumn('Users', 'activated'))
};
