import chai from 'chai';
import sinon from 'sinon';
import db from '../../db/models';
import { createUser, createArticle } from '../helpers';
import { transporter } from '../../utils/mailer';
import Notifications from '../../utils/notifications';

const { expect } = chai;
let hamza;
let vincent;
let hamzaArticle;
let mockTransporter;
let mockPusher;
let createSpy;
let bulkCreateSpy;

describe('Notification functions', () => {
  before(async () => {
    mockTransporter = sinon.stub(transporter, 'sendMail').resolves({});
    mockPusher = sinon.stub(Notifications.pusher, 'trigger').resolves({});
    await db.User.destroy({ truncate: true, cascade: true });
    vincent = await createUser({
      firstName: 'vincent',
      lastName: 'ola',
      email: 'vnay@gmail.com',
      username: 'vnay',
      password: 'password'
    });
    vincent = vincent.dataValues;
    hamza = await createUser({
      firstName: 'hamza',
      lastName: 'Abdul',
      email: 'fantastic@gmail.com',
      username: 'fantastic-genius',
      password: 'password'
    });
    hamzaArticle = await createArticle({
      authorId: hamza.id,
      title: 'learn nodeJs',
      description: 'everybody loves nodeJs',
      body: 'people love nodeJs because it is cool'
    });
    hamza = hamza.dataValues;
  });

  after(async () => {
    await db.User.destroy({ truncate: true, cascade: true });
    await db.MemberShip.destroy({ truncate: true, cascade: true });
    mockTransporter.restore();
    mockPusher.restore();
  });
  beforeEach(async () => {
    bulkCreateSpy = sinon.spy(db.Notification, 'bulkCreate');
    createSpy = sinon.spy(db.Notification, 'create');
    await db.Notification.destroy({ truncate: true, cascade: true });
  });
  afterEach(() => {
    createSpy.restore();
    bulkCreateSpy.restore();
  });

  describe('Testing notification function', () => {
    it('should create a new follow notification message', async () => {
      await Notifications.followNotification({ userId: hamza.id, followedUserId: vincent.id });
      expect(createSpy.calledOnce).to.be.true;
      const notificationContent = await db.Notification.findOne({
        where: {
          senderId: hamza.id,
          receiverId: vincent.id
        }
      });

      const { message } = notificationContent.dataValues;
      console.log(message);
      const expectedMsg = {
        name: `${hamza.firstName} ${hamza.lastName}`,
        msg: 'is following you',
        article: null,
      };

      expect((message)).to.equal(JSON.stringify(expectedMsg));
    });

    it('should create a new like notification message', async () => {
      await Notifications.articleNotification({
        userId: vincent.id,
        articleId: hamzaArticle.dataValues.id,
        type: 'like'
      });
      expect(createSpy.calledOnce).to.be.true;
      const notificationContent = await db.Notification.findOne({
        where: {
          senderId: vincent.id,
          receiverId: hamza.id
        },
      });
      const expectedMsg = {
        name: `${vincent.firstName} ${vincent.lastName}`,
        msg: 'likes your article',
        article: hamzaArticle.title,
      };
      const { message } = notificationContent.dataValues;
      expect((message)).to.equal(JSON.stringify(expectedMsg));
    });

    it('should create a new comment notification message', async () => {
      await Notifications.articleNotification({
        userId: vincent.id,
        articleId: hamzaArticle.dataValues.id,
        type: 'comment'
      });
      expect(createSpy.calledOnce).to.be.true;
      const notificationContent = await db.Notification.findOne({
        where: {
          senderId: vincent.id,
          receiverId: hamza.id
        }
      });

      const expectedMsg = {
        name: `${vincent.firstName} ${vincent.lastName}`,
        msg: 'commented on your article',
        article: hamzaArticle.title,
      };
      const { message } = notificationContent.dataValues;
      expect((message)).to.equal(JSON.stringify(expectedMsg));
    });

    it('should create a new dislike notification message', async () => {
      await Notifications.articleNotification({
        userId: vincent.id,
        articleId: hamzaArticle.dataValues.id,
        type: 'dislike'
      });

      expect(createSpy.calledOnce).to.be.true;
      const notificationContent = await db.Notification.findOne({
        where: {
          senderId: vincent.id,
          receiverId: hamza.id
        }
      });

      const expectedMsg = {
        name: `${vincent.firstName} ${vincent.lastName}`,
        msg: 'dislikes your article',
        article: hamzaArticle.title,
      };
      const { message } = notificationContent.dataValues;
      expect((message)).to.equal(JSON.stringify(expectedMsg));
    });

    it('should get a new publish notification message', async () => {
      await db.MemberShip.create({
        followId: hamza.id,
        followerId: vincent.id
      });

      await Notifications.articleNotification({
        userId: hamza.id,
        articleId: hamzaArticle.dataValues.id,
        type: 'publish'
      });

      expect(bulkCreateSpy.calledOnce).to.be.true;
      const notificationContent = await db.Notification.findOne({
        where: {
          senderId: hamza.id,
          receiverId: vincent.id
        }
      });

      const expectedMsg = {
        name: `${hamza.firstName} ${hamza.lastName}`,
        msg: 'published a new article titled',
        article: hamzaArticle.title,
      };
      const { message } = notificationContent.dataValues;
      expect((message)).to.equal(JSON.stringify(expectedMsg));
    });
  });
});
