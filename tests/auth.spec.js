import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, db } from '../index';

const { expect } = chai;

chai.use(chaiHttp);
let user = {};
describe('Send email verification', () => {
  beforeEach(async () => {
    user = {
      name: 'vincent',
      password: '12345678',
      email: 'frank@gmail.com',
      activationToken: 'sample_secret'
    };
    await db.tempUsers.destroy({ truncate: true, cascade: false });
  });
  describe('Sign Up email Activation', () => {
    it('should send verification mail', async () => {
      const res = await chai
        .request(app)
        .post('/signup')
        .send(user);
      expect(res.body).to.be.an('object');
      expect(res).to.have.status(201);
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include(
        'Registration successfull, Please check email to activate account!'
      );
    });
    it('should activate verification mail', async () => {
      await db.tempUsers.create(user);
      const res = await chai
        .request(app)
        .put(`/activate/${user.activationToken}`)
        .send();
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('message');
      expect(res.body.message).to.be.a('string');
      expect(res.body.message).to.include('Activation successful, You can now login');
    });
    it('should not activate user if token is wrong', async () => {
      user.activationToken = 'wrongtoken';
      const res = await chai
        .request(app)
        .put(`/activate/${user.activationToken}`)
        .send();
      expect(res).to.have.status(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('error');
      expect(res.body.error).to.be.a('string');
      expect(res.body.error).to.include('Invalid activation Link');
    });
  });
});
