module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      receiverId: DataTypes.INTEGER,
      senderId: DataTypes.INTEGER,
      seen: DataTypes.BOOLEAN,
      message: DataTypes.TEXT,
      link: DataTypes.STRING,
    },
    {}
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver',
    });
  };
  return Notification;
};
