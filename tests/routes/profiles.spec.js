import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { app, db } from '../../server';
import { createUser } from '../helpers';
import { transporter } from '../../utils/mailer';

const { expect } = chai;

let mockTransporter;

chai.use(chaiHttp);
let profile = {};
let user = {};
describe('USER PROFILE', () => {
  before(async () => {
    mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});
    profile = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'wkev',
      password: '12345678',
      email: 'pro@gmail.com'
    };

    user = await createUser(profile);
  });
  after(async () => {
    mockTransporter.restore();
    await db.User.destroy({ truncate: true, cascade: true });
  });

  describe('Get user profile', () => {
    it('should get user profile if username is valid', async () => {
      const { username } = user;
      const res = await chai
        .request(app)
        .get(`/api/v1/profiles/${username}`)
        .send();
      expect(res.body).to.be.an('object');
      expect(res.body).to.include.all.keys('user');
      expect(res.body.user.firstName).to.equal(user.firstName);
      expect(res.body.user.lastName).to.equal(user.lastName);
      expect(res.body.user.username).to.equal(user.username);
      expect(res.body.user.bio).to.equal(null);
      expect(res.body.user.image).to.equal(null);
      expect(res.body.user.email).to.equal(user.email);
    });

    it('Should not get user profile if username does not exist', async () => {
      const res = await chai
        .request(app)
        .get('/api/v1/profiles/wrongusername')
        .send();
      expect(res.status).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('User does not exist');
    });
  });
});
