module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Users', 'passwordResetToken', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    .then(() => queryInterface.addColumn('Users', 'passwordResetExpire', {
      type: Sequelize.DATE,
      allowNull: true,
    })),
  down: queryInterface => queryInterface.removeColumn('Users', 'passwordResetToken').then(() => queryInterface.removeColumn('Users', 'passwordResetExpire')),
};
