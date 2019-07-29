import Pusher from 'pusher';
import db from '../../db/models';
import { sendMail } from '../mailer';
import emailTemplate from './mails';

require('dotenv').config();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

const pushNotification = (users) => {
  users.forEach((user) => {
    pusher.trigger('notifications', `event-${user.id}`, 'You have a notification');
  });
};

const createNotificationMsg = async ({
  senderId, receiverId, message, link,
}) => {
  const notifyMsg = await db.Notification.create({
    message,
    link,
    senderId,
    receiverId
  });
  return notifyMsg;
};

const sendEmailNotification = async (email, msg, link) => {
  await sendMail({
    email,
    subject: 'Notification from author haven',
    content: emailTemplate(msg, link),
  });
};

const followNotification = async ({ userId, followedUserId }) => {
  const user = await db.User.findOne({
    where: {
      id: userId
    }
  });

  const followedUser = await db.User.findOne({
    where: {
      id: followedUserId
    }
  });

  const { emailNotify, inAppNotify, email } = followedUser;
  const message = `${user.firstName} ${user.lastName} is following you`;
  const emailMsg = `<strong>${user.firstName} ${user.lastName}</strong> is following you`;
  const link = `/profile/${user.username}`;

  if (emailNotify) await sendEmailNotification(email, emailMsg, link);
  if (inAppNotify) {
    await createNotificationMsg({
      message,
      link,
      senderId: userId,
      receiverId: followedUser.id
    });
    pushNotification([followedUserId]);
  }
};

const bulkNotify = async ({
  senderId, message, emailMsg, link
}) => {
  const inApp = await db.MemberShip.findAll({
    where: {
      followId: senderId
    },
    include: [{
      model: db.User,
      as: 'follower',
      where: {
        inAppNotify: true,
      },
      attributes: ['id']
    }]
  });

  const emailNotify = await db.MemberShip.findAll({
    where: {
      followId: senderId
    },
    include: [{
      model: db.User,
      as: 'follower',
      where: {
        emailNotify: true,
      },
      attributes: ['email']
    }]
  });
  const followersIds = inApp.map(user => user.follower.id);
  const followersEmails = emailNotify.map(user => user.follower.email);

  sendEmailNotification(followersEmails, emailMsg, link);

  const data = followersIds.map(receiverId => ({
    receiverId, senderId, message, link
  }));

  await db.Notification.bulkCreate(data);
  await pushNotification(followersIds);
};


const articleNotification = async ({ userId, articleId, type }) => {
  const user = await db.User.findOne({
    where: {
      id: userId
    }
  });

  const article = await db.Article.findOne({
    where: {
      id: articleId
    },
    include: ['author']
  });

  const author = article.author.dataValues;
  const authorId = author.id;
  const { emailNotify, inAppNotify, email } = author;
  const { title } = article;
  const { slug } = article;
  const link = `/articles/${slug}`;

  if (type === 'publish') {
    const publishMsg = `${author.firstName} ${author.lastName} published a new article titled "${title}"`;
    const publishEmailMsg = `${author.firstName} ${author.lastName} published a new article titled <strong>${title}</strong>`;
    await bulkNotify({
      senderId: userId,
      message: publishMsg,
      emailMsg: publishEmailMsg,
      link
    });
  } else {
    let msgType;
    if (type === 'like') msgType = 'likes';
    else if (type === 'dislike') msgType = 'dislikes';
    else msgType = 'commented on';

    const message = `${user.firstName} ${user.lastName} ${msgType} your article "${title}"`;
    const emailMsg = `${user.firstName} ${user.lastName} ${msgType} your article <strong>${title}</strong>`;

    if (emailNotify) await sendEmailNotification(email, emailMsg, link);


    if (inAppNotify) {
      await createNotificationMsg({
        senderId: userId, receiverId: authorId, message, link
      });
      await pushNotification([userId]);
    }
  }
};

export default { articleNotification, followNotification, pusher };
