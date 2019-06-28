module.exports = (sequelize, DataTypes) => {
  const tempUsers = sequelize.define('tempUsers', {
    name: {
      type: DataTypes.STRING,
      required: true
    },
    password: {
      type: DataTypes.STRING,
      required: true
    },
    email: {
      type: DataTypes.STRING,
      required: true
    },
    activationToken: {
      type: DataTypes.STRING,
      required: true
    },
    activated: {
      type: DataTypes.BOOLEAN,
      default: false
    }
  });
  tempUsers.associate = function(models) {};
  return tempUsers;
};
