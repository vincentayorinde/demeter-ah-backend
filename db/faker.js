const readingTime = require('read-time');
const faker = require('faker');
const bcrypt = require('bcryptjs');

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
    Articles[i].slug = `slug${i}`;
  }
  return Articles;
};

const createFakeArticleVotes = (userId, articleId) => {
  const Votes = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 40; i++) {
    Votes.push({
      status: Boolean(i % 2),
      userId,
      articleId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return Votes;
};

const getFakeUser = () => ({
  email: faker.internet.email(),
  bio: faker.random.word('string'),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.name.firstName(),
  password: bcrypt.hashSync('password', 10),
  image: faker.image.imageUrl(),
  role: 'author'
});

const getFakeAdmin = async () => ({
  email: 'admin@haven.com',
  bio: faker.random.word('string'),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.random.words(4),
  password: await bcrypt.hash('password', 10),
  image: faker.image.imageUrl(),
  role: 'admin',
});

const createFakeUsers = async () => {
  const Users = [];
  Users.push({ ...getFakeUser(), email: 'sampoli@gmail.com' },
    await getFakeAdmin());

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 40; i++) {
    const user = getFakeUser();
    user.username = `${user.username}${i}`;
    Users.push(user);
  }
  return Users;
};

module.exports = {
  getFakeArticle,
  createFakeArticles,
  getFakeUser,
  createFakeUsers,
  getFakeAdmin,
  createFakeArticleVotes
};
