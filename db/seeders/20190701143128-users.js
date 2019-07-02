import bcrypt from 'bcryptjs';

const password = bcrypt.hash('12345678', 10);

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', [{
    firstName: 'John',
    lastName: 'Doe',
    username: 'john',
    password,
    email: 'john@haven.com'
  },
  {
    firstName: 'James',
    lastName: 'Mark',
    username: 'james',
    password,
    email: 'james@haven.com'
  }], {}),
  down: queryInterface => queryInterface.bulkDelete('User', null, {})
};
