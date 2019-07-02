import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, db } from '../../server';
import { createUser } from '../../utils';

const { expect } = chai;

chai.use(chaiHttp);
let register = {};
let login = {};
let user;
describe('USER AUTHENTICATION', () => {
  before(async () => {
    register = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kev',
      password: '12345678',
      email: 'frank@gmail.com'
    };

    user = await createUser(register);
  });

  beforeEach(async () => {
    login = {
      password: '12345678',
      email: 'frank@gmail.com'
    };
  });

  after(async () => {
    await db.User.destroy({ truncate: true, cascade: false });
  });

  describe('Sign up', () => {
    it('should sign up user if info is valid', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/users/signup')
        .send({
          ...register,
          email: 'john@havens.com'
        });
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('user', 'message');
      expect(res.body.user).to.be.an('object');
      expect(res.body.message).to.be.a('string');
      expect(res.body.user.firstName).to.include(register.firstName);
      expect(res.body.user.lastName).to.include(register.lastName);
      expect(res.body.user.username).to.include(register.username);
      expect(res.body.user.email).to.include('john@havens.com');
    });

    it('Should not signup user with invalid data', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/users/signup')
        .send({
          ...register,
          firstName: 9999,
          email: 'frank.john'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message[0].message).to.equal('Only letters allowed as firstName');
      expect(res.body.message[1].message).to.equal('The value provided is not an email');
    });

    it('Should not signup user with already existing email', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/users/signup')
        .send(register);
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message[0].message).to.equal('email already existed');
    });
  });

  describe('Log in', () => {
    it('should not login user if info is invalid', async () => {
      login.password = '1234567';
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

    it('Should not login user with invalid data', async () => {
      const res = await chai
        .request(app)
        .post('/api/v1/users/login')
        .send({
          ...login,
          email: 'frank.john'
        });
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message[0].message).to.equal('The value provided is not an email');
    });
  });

  describe('Sign Out', () => {
    it('should sign user out', async () => {
      const { token } = user.response();
      const res = await chai
        .request(app)
        .post('/api/v1/users/signout')
        .set('x-access-token', token)
        .send(login);
      expect(res.body).to.be.an('object');
      expect(res.status).to.equal(200);
    });
  });
});
