const faker = require('faker');

const getFakeArticle = id => ({
  title: faker.random.words(4),
  body: faker.random.word('string'),
  description: faker.random.words(4),
  authorId: id,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createFakeArticles = (id) => {
  const Articles = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 40; i++) {
    Articles.push(getFakeArticle(id));
  }
  return Articles;
};

const getFakeUser = () => ({
  email: 'sampoli@gmail.com',
  bio: faker.random.word('string'),
  firstName: faker.random.words(4),
  lastName: faker.random.words(4),
  username: faker.random.words(4),
  password: faker.random.words(10),
});

const createFakeUser = () => {
  const Articles = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 40; i++) {
    Articles.push(getFakeUser());
  }
  return Articles;
};

module.exports = {
  getFakeArticle,
  createFakeArticles,
  getFakeUser,
  createFakeUser,
};
