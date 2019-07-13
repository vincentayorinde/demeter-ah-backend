const readingTime = require('read-time');
const faker = require('faker');

const getFakeArticle = id => ({
  title: faker.random.words(4),
  body: faker.random.word('string'),
  description: faker.random.words(4),
  authorId: id,
  createdAt: new Date(),
  updatedAt: new Date(),
  readTime: readingTime(faker.random.word('string')).text
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
  email: faker.internet.email(),
  bio: faker.random.word('string'),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.random.words(4),
  password: faker.random.words(10),
  image: faker.image.imageUrl(),
  role: 'author'
});

const getFakeAdmin = () => ({
  email: 'admin@haven.com',
  bio: faker.random.word('string'),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.random.words(4),
  password: 'password',
  image: faker.image.imageUrl(),
  role: 'admin',
});

const createFakeUsers = () => {
  const Users = [];
  Users.push({ ...getFakeUser(), email: 'sampoli@gmail.com' }, getFakeAdmin());

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 40; i++) {
    Users.push(getFakeUser());
  }
  return Users;
};

module.exports = {
  getFakeArticle,
  createFakeArticles,
  getFakeUser,
  createFakeUsers,
  getFakeAdmin
};
