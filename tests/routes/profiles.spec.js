import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, db } from '../../server';
import { createUser } from '../../utils';

const { expect } = chai;

chai.use(chaiHttp);
let profile = {};
let user = {};
describe('USER PROFILE', () => {
  before(async () => {
    profile = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kev',
      password: '12345678',
      email: 'pro@gmail.com'
    };

    user = await createUser(profile);
  });
  after(async () => {
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
      expect(res.body).to.include.all.keys('profile');
      expect(res.body.profile.firstName).to.equal(profile.firstName);
      expect(res.body.profile.lastName).to.equal(profile.lastName);
      expect(res.body.profile.username).to.equal(profile.username);
      expect(res.body.profile.bio).to.equal(null);
      expect(res.body.profile.image).to.equal(null);
      expect(res.body.profile.email).to.equal(profile.email);
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
