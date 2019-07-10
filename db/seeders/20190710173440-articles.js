const { createFakeArticles } = require('../faker');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete('Articles', null, {});
    const user = await queryInterface.rawSelect('Users', {
      where: {
        email: 'sampoli@gmail.com',
      },
    }, ['id']);
    return queryInterface.bulkInsert('Articles', createFakeArticles(user), {});
  },

  down: queryInterface => queryInterface.bulkDelete('Articles', null, {})
};
