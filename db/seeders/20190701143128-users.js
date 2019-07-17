const { createFakeUsers } = require('../faker');

module.exports = {
  up: async (queryInterface) => {
    const user = await queryInterface.rawSelect('Users', {
      where: {
        email: 'sampoli@gmail.com',
      },
    }, ['email']);
    if (!user) queryInterface.bulkInsert('Users', await createFakeUsers(), {});
  },

  down: queryInterface => queryInterface.bulkDelete('Users', null, {})
};
