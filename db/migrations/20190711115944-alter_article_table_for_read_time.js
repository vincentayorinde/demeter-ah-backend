module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Articles', 'readTime', {
      allowNull: false,
      type: Sequelize.STRING,
    }),
  down: queryInterface => queryInterface.removeColumn('Articles', 'readTime'),
};
