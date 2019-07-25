const { createFakeArticleVotes } = require('../faker');

module.exports = {
  up: async (queryInterface) => {
    const user = await queryInterface.rawSelect('Users', {
      where: {
        email: 'sampoli@gmail.com',
      },
    }, ['id']);
    const article = await queryInterface.rawSelect('Articles', {
      limit: 1,
      where: {
        authorId: user,
      },
    }, ['id']);

    return queryInterface.bulkInsert('ArticleVotes', createFakeArticleVotes(user, article), {});
  },

  down: queryInterface => queryInterface.bulkDelete('Articles', null, {})
};
