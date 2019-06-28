import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, db } from '../../server';

const { expect } = chai;

chai.use(chaiHttp);
let register = {};
let login = {};
describe('USER AUTHENTICATION', () => {
  beforeEach(async () => {
    register = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kev',
      password: '12345678',
      email: 'frank@gmail.com'
    };
    login = {
      password: '12345678',
      email: 'frank@gmail.com'
    };
    await db.User.destroy({ truncate: true, cascade: false });
  });
  describe('Sign up', () => {
    it('should sign up user if info is valid', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/users/signup')
        .send(register);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('user', 'message');
      expect(res.body.user).to.be.an('object');
      expect(res.body.message).to.be.a('string');
      expect(res.body.user.firstName).to.include(register.firstName);
      expect(res.body.user.lastName).to.include(register.lastName);
      expect(res.body.user.username).to.include(register.username);
      expect(res.body.user.email).to.include(register.email);
    });
  });
  describe('Log in', () => {
    it('should not login user if info is invalid', async () => {
      login.password = '1234567';
      const {
        firstName, lastName, password, email, bio, username, image
      } = register;
      await db.User.create({
        firstName,
        lastName,
        password,
        email,
        bio,
        username,
        image
      });
      const res = await chai
        .request(app)
        .post('/api/v1/users/login')
        .send(login);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('error');
      expect(res.body.error).to.be.a('string');
      expect(res.body.error).to.include('Invalid email or password');
    });
    it('should login user if info is valid', async () => {
      const {
        firstName, lastName, password, email, bio, username, image
      } = register;
      await db.User.create({
        firstName,
        lastName,
        password,
        email,
        bio,
        username,
        image
      });
      const res = await chai
        .request(app)
        .post('/api/v1/users/login')
        .send(login);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('user', 'message');
      expect(res.body.user).to.be.an('object');
      expect(res.body.message).to.be.a('string');
      expect(res.body.user).to.include.all.keys('token', 'id', 'firstName', 'lastName', 'username');
      expect(res.body.user.email).to.include(login.email);
    });
  });
});
