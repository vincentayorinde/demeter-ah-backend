import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { createUser } from '../helpers';
import { app, db } from '../../server';
import { transporter } from '../../utils/mailer';


const { expect } = chai;

chai.use(chaiHttp);
let mockTransporter;
let user1;
let user2;
let user3;
let user4;

describe('FOLLOW TEST', () => {
  beforeEach(async () => {
    mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});
    await db.User.destroy({ truncate: true, cascade: true });
    await db.MemberShip.destroy({ truncate: true, cascade: true });
    user1 = await createUser({
      firstName: 'user1',
      lastName: 'lastname',
      username: 'user1-name',
      password: '12345678',
      email: 'user1@gmail.com',
    });
    user2 = await createUser({
      firstName: 'user2',
      lastName: 'lastname',
      username: 'user2-name',
      password: '12345678',
      email: 'user2@gmail.com',
    });
    user3 = await createUser({
      firstName: 'user3',
      lastName: 'lastname',
      username: 'user3-name',
      password: '12345678',
      email: 'user3@gmail.com',
    });
    user4 = await createUser({
      firstName: 'user4',
      lastName: 'lastname',
      username: 'user4-name',
      password: '12345678',
      email: 'user4@gmail.com',
    });
  });

  afterEach(async () => {
    mockTransporter.restore();
    await db.User.sync({ truncate: true, casade: true });
    await db.MemberShip.sync({ truncate: true, casade: true });
  });

  it('a user should be able to follow other users', async () => {
    const userResponse = user1.response();
    const user2Id = user2.response().id;
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .post('/api/v1/members')
      .send({
        followId: user2Id
      })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.followId).to.equal(user2Id);
    expect(res.body.user.followerId).to.equal(userResponse.id);
    expect(res.body).to.be.an('object');
  });

  it('a user should not be able to follow himself', async () => {
    const userResponse = user1.response();
    const { token, id } = userResponse;
    const res = await chai
      .request(app)
      .post('/api/v1/members')
      .send({
        followId: id
      })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(400);
    expect(res.body.error).to.equal('you can\'t follow yourself');
  });

  it('a user should be able to unfollow a user his following', async () => {
    const userResponse = user1.response();
    const user2Id = user2.response().id;
    const { token } = userResponse;
    const followerId = userResponse.id;
    const followId = user2Id;

    await db.MemberShip.create({
      followerId,
      followId
    });
    const res = await chai
      .request(app)
      .post('/api/v1/members')
      .send({
        followId: user2Id
      })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.message).to.equal('unfollow successful');
    expect(res.body).to.be.an('object');
  });

  it('should return user not found if user to follow is not found', async () => {
    const userResponse = user1.response();
    const { token } = userResponse;

    const res = await chai
      .request(app)
      .post('/api/v1/members')
      .send({
        followId: 2345678
      })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(404);
    expect(res.body.error).to.equal('user not found');
    expect(res.body).to.be.an('object');
  });


  it('a user should be able see all those his following', async () => {
    const userResponse = user1.response();
    const user1Id = userResponse.id;
    const user2Id = user2.response().id;
    const user3Id = user3.response().id;
    const user4Id = user4.response().id;
    const { token } = userResponse;

    await db.MemberShip.create({ followerId: user1Id, followId: user2Id });
    await db.MemberShip.create({ followerId: user1Id, followId: user3Id });
    await db.MemberShip.create({ followerId: user1Id, followId: user4Id });

    await db.MemberShip.findAll();
    const res = await chai
      .request(app)
      .get('/api/v1/members/following')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.user).to.be.an('object');
    expect(res.body.user.following).to.be.an('array');
    expect(res.body.user.following).to.be.an('array');
    expect(res.body.user).to.include.all
      .keys('following', 'username', 'id', 'email', 'firstName', 'lastName', 'image');
  });

  it('a user should be able see all those following him', async () => {
    const userResponse = user1.response();
    const user1Id = userResponse.id;
    const user2Id = user2.response().id;
    const user3Id = user3.response().id;
    const user4Id = user4.response().id;
    const { token } = userResponse;

    await db.MemberShip.create({ followerId: user2Id, followId: user1Id });
    await db.MemberShip.create({ followerId: user3Id, followId: user1Id });
    await db.MemberShip.create({ followerId: user4Id, followId: user1Id });

    await db.MemberShip.findAll();
    const res = await chai
      .request(app)
      .get('/api/v1/members/followers')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.user).to.be.an('object');
    expect(res.body.user.followers).to.be.an('array');
    expect(res.body.user.followers).to.be.an('array');
    expect(res.body.user).to.include.all
      .keys('followers', 'username', 'id', 'email', 'firstName', 'lastName', 'image');
  });

  it('should throw validation error if followId is not present', async () => {
    const userResponse = user1.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .post('/api/v1/members')
      .send({ followId: '' })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.be.an('array');
    expect(res.body.message[0].message).to.equal('Input your followId');
  });

  it('should throw validation error if followId is not present', async () => {
    const userResponse = user1.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .post('/api/v1/members')
      .send({ followId: 'tyuio' })
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.be.an('array');
    expect(res.body.message[0].message).to.equal('followId must be an integer');
  });
});
