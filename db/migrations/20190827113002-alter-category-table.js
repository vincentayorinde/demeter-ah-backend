module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Categories', 'description', {
      type: Sequelize.TEXT
    })
    .then(() => queryInterface.addColumn('Categories', 'image', {
      type: Sequelize.STRING
    })),
  down: queryInterface => queryInterface.removeColumn('Categories', 'description')
    .then(() => queryInterface.removeColumn('Categories', 'image')),
};
