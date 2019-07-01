import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, db } from '../index';

const { expect } = chai;

chai.use(chaiHttp);
let user = {};
describe('Password reset', () => {
  beforeEach(async () => {
    user = {
      name: 'kelvin',
      password: 'password',
      email: 'kevo@gmail.com',
      activationToken: 'sample_secret',
      activated: true,
    };
    await db.tempUsers.destroy({ truncate: true, cascade: false });
  });
  describe('should be able to reset password', () => {
    it('should send reset password link for an existing user', async () => {
      await db.tempUsers.create(user);
      const res = await chai
        .request(app)
        .post('/reset-password')
        .send({ email: user.email });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(200);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include(
        'Password reset successful. Check your email for password reset link!'
      );
    });
    it('should not send a reset password link for a user that does not exist', async () => {
      await db.tempUsers.create(user);
      const res = await chai
        .request(app)
        .post('/reset-password')
        .send({ email: 'wrong@gmail.com' });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(400);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Bad request');
    });
  });
  describe('should be able to change password', () => {
    it('should not change the password on invalid token', async () => {
      const date = new Date();
      date.setHours(date.getHours() + 2);
      await db.tempUsers.create({
        ...user,
        resetToken: 'sample-test-token',
        resetExpire: date,
      });
      const res = await chai
        .request(app)
        .put('/change-password?resetToken=wrong-test-token')
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
      await db.tempUsers.create({
        ...user,
        resetToken: 'sample-test-token',
        resetExpire: date,
      });
      const res = await chai
        .request(app)
        .put('/change-password?resetToken=sample-test-token')
        .send({ password: '12345678' });
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(200);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include(
        'Password has successfully been changed.'
      );
    });
  });
});
