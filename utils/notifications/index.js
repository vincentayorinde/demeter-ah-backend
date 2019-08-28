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

const pushNotification = (userIds) => {
  userIds.forEach((id) => {
    pusher.trigger('notifications', `event-${id}`, 'You have a new notification');
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
  const message = JSON.stringify({
    name: `${user.firstName} ${user.lastName}`,
    msg: 'is following you',
    article: null
  });
  const emailMsg = `<strong>${user.firstName} ${user.lastName}</strong> is following you`;
  const link = `/profile/${user.username}/articles`;

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
    const publishMsg = JSON.stringify({
      name: `${author.firstName} ${author.lastName}`,
      msg: 'published a new article titled',
      article: title
    });
    const publishEmailMsg = `<strong>${author.firstName} ${author.lastName}</strong> published a new article titled <strong>${title}</strong>`;
    await bulkNotify({
      senderId: userId,
      message: publishMsg,
      emailMsg: publishEmailMsg,
      link
    });
  } else {
    if (user.id === author.id) {
      return;
    }
    let msgType;
    if (type === 'like') msgType = 'likes';
    else if (type === 'dislike') msgType = 'dislikes';
    else msgType = 'commented on';

    const message = JSON.stringify({
      name: `${user.firstName} ${user.lastName}`,
      msg: `${msgType} your article`,
      article: title
    });
    const emailMsg = `${user.firstName} ${user.lastName} ${msgType} your article <strong>${title}</strong>`;

    if (emailNotify) sendEmailNotification(email, emailMsg, link);


    if (inAppNotify) {
      await createNotificationMsg({
        senderId: userId, receiverId: authorId, message, link
      });
      pushNotification([authorId]);
    }
  }
};

export default { articleNotification, followNotification, pusher };
