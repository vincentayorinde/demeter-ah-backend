import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, db } from '../../server';

const { expect } = chai;

chai.use(chaiHttp);
let user = {};
let profile = {};
describe('USER ROLE', () => {
  beforeEach(async () => {
    profile = {
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'wkev43',
      password: '12345678',
      email: 'pro23@gmail.com',
      role: 'admin'
    };
  });
  afterEach(async () => {
    await db.User.destroy({ truncate: true, cascade: true });
  });
  describe('Change user role', async () => {
    it('should change user role if user is admin and authenticated', async () => {
      user = await db.User.create(profile);
      const userResponse = user.response();
      const { token } = userResponse;
      const { username } = user;
      const res = await chai
        .request(app)
        .patch(`/api/v1/role/${username}`)
        .set('x-access-token', token)
        .send({ role: 'admin' });
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to.equal('User role updated successfully');
    });

    it('should not change user role if authenticated user is not admin', async () => {
      user = await db.User.create({ ...profile, role: 'author' });
      const userResponse = user.response();
      const { token } = userResponse;
      const { username } = user;
      const res = await chai
        .request(app)
        .patch(`/api/v1/role/${username}`)
        .set('x-access-token', token)
        .send({ role: 'admin' });
      expect(res.status).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('Unauthorized');
    });

    it('should not change user role if user does not exist', async () => {
      user = await db.User.create({ ...profile, role: 'admin' });
      const userResponse = user.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .patch('/api/v1/role/wrong-user')
        .set('x-access-token', token)
        .send({ role: 'admin' });
      expect(res.status).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.error).to.equal('User does not exist');
    });

    it('should not change user role if role value is not author or admin', async () => {
      user = await db.User.create({ ...profile, role: 'admin' });
      const userResponse = user.response();
      const { token } = userResponse;
      const res = await chai
        .request(app)
        .patch('/api/v1/role/wrong-user')
        .set('x-access-token', token)
        .send({ role: 'wrong' });
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body.message[0].message).to.equal('Wrong user role provided');
    });
  });
});
