import bcrypt from 'bcryptjs';
import { getToken, randomString } from '../../utils';
import { sendMail } from '../../utils/mailer';
import { activationMessage } from '../../utils/mailer/mails';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: DataTypes.STRING,
      bio: DataTypes.STRING,
      image: DataTypes.STRING,
      username: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      password: DataTypes.STRING,
      social: DataTypes.BOOLEAN,
      passwordResetToken: DataTypes.STRING,
      passwordResetExpire: DataTypes.DATE,
      emailVerificationToken: DataTypes.STRING,
      emailNotify: {
        type: DataTypes.BOOLEAN,
        default: true,
      },
      inAppNotify: {
        type: DataTypes.BOOLEAN,
        default: true,
      },
      activated: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      role: {
        type: DataTypes.ENUM,
        default: 'author',
        values: ['author', 'admin']
      }
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          user.password = !user.social
            ? await bcrypt.hash(user.password, 10)
            : null;
          user.emailVerificationToken = !user.social ? randomString() : null;
        },
        afterCreate: async (user) => {
          if (!user.social) {
            sendMail({
              email: user.email,
              subject: 'Activate Account',
              content: activationMessage(
                user.email,
                user.emailVerificationToken
              ),
            });
          }
        },
      },
    }
  );
  User.associate = (models) => {
    User.hasMany(models.Article, {
      foreignKey: 'authorId',
      as: 'article',
      cascade: true,
    });

    User.hasMany(models.Ratings, {
      foreignKey: 'userId',
      as: 'rate',
      cascade: true,
    });

    User.hasMany(models.ArticleVote, {
      foreignKey: 'userId',
      as: 'articleVote',
      cascade: true
    });
    User.hasMany(models.Notification, {
      foreignKey: 'receiverId',
      as: 'notifications',
      cascade: true,
    });

    User.hasMany(models.MemberShip, {
      foreignKey: 'followerId',
      as: 'following',
      cascade: true,
    });

    User.hasMany(models.MemberShip, {
      foreignKey: 'followId',
      as: 'followers',
      cascade: true,
    });

    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comment',
      cascade: true,
    });
  };

  User.prototype.passwordsMatch = function match(password) {
    return bcrypt.compare(password, this.password);
  };
  User.prototype.response = function response(addToken = true) {
    const userData = {
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      username: this.username,
      bio: this.bio,
      image: this.image,
      firstName: this.firstName,
      lastName: this.lastName,
      id: this.id,
    };
    if (addToken) userData.token = getToken(this.id, this.email);
    return userData;
  };
  return User;
};
