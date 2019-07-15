module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('Users', 'role', {
      type: Sequelize.ENUM,
      values: [
        'author',
        'admin',
      ],
      allowNull: false,
      defaultValue: 'author'
    }),
  down: queryInterface => Promise.all([
    queryInterface.removeColumn('Users', 'role'),
    queryInterface.sequelize.query('DROP TYPE "enum_Users_role";')
  ])
};
