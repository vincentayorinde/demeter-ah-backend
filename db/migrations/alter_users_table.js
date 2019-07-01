module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .addColumn('tempUsers', 'resetToken', {
        type: Sequelize.STRING,
        allowNull: true,
      })
      .then(() =>
        queryInterface.addColumn('tempUsers', 'resetExpire', {
          type: Sequelize.DATE,
          allowNull: true,
        })),
  down: queryInterface =>
    queryInterface
      .removeColumn('tempUsers', 'resetToken')
      .then(() => queryInterface.removeColumn('tempUsers', 'resetExpire')),
};
