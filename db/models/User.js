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
      activated: {
        type: DataTypes.BOOLEAN,
        default: false
      }
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          user.password = !user.social ? await bcrypt.hash(user.password, 10) : null;
          user.emailVerificationToken = !user.social ? randomString() : null;
        },
        afterCreate: async (user) => {
          if (!user.social) {
            await sendMail({
              email: user.email,
              subject: 'Activate Account',
              content: activationMessage(user.email, user.emailVerificationToken)
            });
          }
        }
      }
    }
  );
  User.associate = models => User.hasMany(models.Article, {
    foreignKey: 'userId',
    cascade: true
  });

  User.prototype.passwordsMatch = function match(password) {
    return bcrypt.compare(password, this.password);
  };
  User.prototype.response = function response() {
    const token = getToken(this.id, this.email);
    return {
      email: this.email,
      token,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      username: this.username,
      bio: this.bio,
      image: this.image,
      firstName: this.firstName,
      lastName: this.lastName,
      id: this.id
    };
  };
  return User;
};
