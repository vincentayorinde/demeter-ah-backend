import bcrypt from 'bcryptjs';
import getToken from '../../utils';

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
      password: DataTypes.STRING
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  );
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
