module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Comments', 'highlightedText', {
      allowNull: true,
      type: Sequelize.TEXT,
    }),
  down: queryInterface => queryInterface.removeColumn('Comments', 'highlightedText'),
};
