import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { transporter } from '../../utils/mailer';
import { app, db } from '../../server';
import { createUser } from '../../utils';

const { expect } = chai;

const mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});

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
    mockTransporter.restore();
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
  describe('PASSWORD RESET', () => {
    beforeEach(async () => {
      await db.User.destroy({ truncate: true, cascade: false });
    });

    it('should send reset password link for an existing user', async () => {
      await db.User.create(register);

      const res = await chai
        .request(app)
        .post('/api/v1/users/reset-password')
        .send({ email: register.email });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(200);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include(
        'Password reset successful. Check your email for password reset link!'
      );
    });
    it('should not send a reset password link for a user that does not exist', async () => {
      await db.User.create(register);
      const res = await chai
        .request(app)
        .post('/api/v1/users/reset-password')
        .send({ email: 'wrong@gmail.com' });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(400);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('User does not exist');
    });

    it('should not send a reset password on a wrong email format', async () => {
      await db.User.create(register);
      const res = await chai
        .request(app)
        .post('/api/v1/users/reset-password')
        .send({ email: 'wrong@' });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(400);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message[0].message).to.equal('The value provided is not an email');
      expect(res.body.message[0].field).to.equal('email');
    });
  });
  describe('should be able to change password', () => {
    it('should not change the password on invalid token', async () => {
      const date = new Date();
      date.setHours(date.getHours() + 2);
      await db.User.create({
        ...register,
        passwordResetToken: 'sample-test-token',
        passwordResetExpire: date,
        email: 'kelvinese@gmail.com'
      });
      const res = await chai
        .request(app)
        .put('/api/v1/users/change-password?resetToken=wrong-test-token')
        .send({ password: '12345678' });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(400);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Bad request');
    });
    it('should change the password on valid token', async () => {
      const date = new Date();
      date.setHours(date.getHours() + 2);
      await db.User.create({
        ...register,
        email: 'kelvin@gmail.com',
        passwordResetToken: 'sample-test-token',
        passwordResetExpire: date
      });
      const res = await chai
        .request(app)
        .put('/api/v1/users/change-password?resetToken=sample-test-token')
        .send({ password: '12345678' });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(200);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Password has successfully been changed.');
    });

    it('should not change the password on an empty field with wrong resetToken', async () => {
      const date = new Date();
      date.setHours(date.getHours() + 2);
      await db.User.create({
        ...register,
        email: 'kelvin',
        passwordResetToken: 'sample-test-token',
        passwordResetExpire: date
      });
      const res = await chai
        .request(app)
        .put('/api/v1/users/change-password')
        .send({});
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(400);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message[0].message).to.equal('Input your password');
      expect(res.body.message[0].field).to.equal('password');
      expect(res.body.message[1].message).to.equal('Input your resetToken');
      expect(res.body.message[1].field).to.equal('resetToken');
    });
  });
  describe('Signup Email Activation', () => {
    it('should activate verification mail', async () => {
      const newUser = await db.User.create({ ...register, email: 'vinay@yahoo.com' });
      const activationString = newUser.emailVerificationToken;
      const res = await chai
        .request(app)
        .put(`/api/v1/users/activate/${activationString}`)
        .send();
      expect(res).to.have.status(200);
      expect(res.body.user).to.be.an('object');
      expect(res.body.message).to.be.a('string');
      expect(res.body).to.include.all.keys('user', 'message');
      expect(res.body.user.firstName).to.include(register.firstName);
      expect(res.body.user.lastName).to.include(register.lastName);
      expect(res.body.user.username).to.include(register.username);
      expect(res.body.user.email).to.include('vinay@yahoo.com');
      expect(res.body.message).to.include('Activation successful, You can now login');
    });
    it('should not activate user if token is wrong', async () => {
      register.emailActivationToken = 'wrongtoken';
      const res = await chai
        .request(app)
        .put(`/api/v1/users/activate/${register.emailActivationToken}`)
        .send();
      expect(res).to.have.status(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('error');
      expect(res.body.error).to.be.a('string');
      expect(res.body.error).to.include('Invalid activation Link');
    });
  });
});
