import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { createUser } from '../helpers';
import { app, db } from '../../server';
import { transporter } from '../../utils/mailer';

const { expect } = chai;

chai.use(chaiHttp);
let mockTransporter;

describe('USER NOTIFICATIONS', () => {
  beforeEach(async () => {
    mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});
    await db.User.destroy({ truncate: true, cascade: true });
  });
  afterEach(async () => {
    mockTransporter.restore();
    await db.User.sync({ truncate: true, casade: true });
  });

  it('should return 200 and false if user opt out of an email notification', async () => {
    const user = await createUser({
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kevfghjk',
      password: '12345678',
      email: 'prodfd@gmail.com',
    });
    const userResponse = user.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .patch('/api/v1/notifications/email-notify')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.emailNotify).to.equal(false);
  });

  it('should return 200 and true if user opt in to email notification', async () => {
    const user = await db.User.create({
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kefghjkl',
      password: '12345678',
      email: 'prodfd@gmail.com',
      emailNotify: false
    });
    const userResponse = user.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .patch('/api/v1/notifications/email-notify')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.emailNotify).to.equal(true);
  });

  it('should return all the users notifications if any', async () => {
    const user = await createUser({
      firstName: 'user',
      lastName: 'hamza',
      username: 'userhjkl',
      password: '12345678',
      email: 'proftg@gmail.com',
    });
    const userResponse = user.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .get('/api/v1/notifications')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.include.all.keys('notifications');
    expect(res.body.notifications).to.be.an('array');
  });

  it('should change seen status of a notification', async () => {
    const user = await createUser({
      firstName: 'user',
      lastName: 'hamza',
      username: 'userghjkl',
      password: '12345678',
      email: 'proftg@gmail.com',
    });

    const user2 = await createUser({
      firstName: 'user2',
      lastName: 'ham3',
      username: 'newUser',
      password: '12345678',
      email: 'newUder@gmail.com',
    });

    const notification = await db.Notification.create({
      receiverId: user.id,
      senderId: user2.id,
      message: 'somehting',
      link: 'link-to-somthing',
    });

    const userResponse = user.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .patch(`/api/v1/notifications/${notification.id}`)
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.include.all.keys('notification');
    expect(res.body.notification.receiverId).to.equal(user.id);
    expect(res.body.notification.seen).to.equal(true);
    expect(res.body.notification.senderId).to.equal(user2.id);
    expect(res.body.notification.seen).to.equal(true);
    expect(res.body.notification.message).to.equal('somehting');
    expect(res.body.notification.link).to.equal('link-to-somthing');
  });

  it('should return Notification not Found when notification is not found', async () => {
    const user = await createUser({
      firstName: 'user',
      lastName: 'hamza',
      username: 'usehjkl',
      password: '12345678',
      email: 'proftg@gmail.com',
    });

    const userResponse = user.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .patch('/api/v1/notifications/324')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(404);
    expect(res.body.error).to.equal('Notification not Found');
  });

  it('should return 200 and false if user opt out of an app notification', async () => {
    const user = await createUser({
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'kevghl',
      password: '12345678',
      email: 'profgrtg@gmail.com',
    });
    const userResponse = user.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .patch('/api/v1/notifications/app-notify')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.inAppNotify).to.equal(false);
  });

  it('should return 200 and true if user opt in to an app notification', async () => {
    const user = await db.User.create({
      firstName: 'vincent',
      lastName: 'hamza',
      username: 'vghjkl',
      password: '12345678',
      email: 'profgrtg@gmail.com',
      inAppNotify: false,
    });
    const userResponse = user.response();
    const { token } = userResponse;
    const res = await chai
      .request(app)
      .patch('/api/v1/notifications/app-notify')
      .set('x-access-token', token);
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.inAppNotify).to.equal(true);
  });
});
