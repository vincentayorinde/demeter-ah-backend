module.exports = (sequelize, DataTypes) => {
  const MemberShip = sequelize.define('MemberShip', {
    followerId: DataTypes.INTEGER,
    followId: DataTypes.INTEGER
  }, {});

  MemberShip.associate = (models) => {
    MemberShip.belongsTo(models.User, {
      foreignKey: 'followerId',
      as: 'follower',
    });

    MemberShip.belongsTo(models.User, {
      foreignKey: 'followId',
      as: 'followed',
    });
  };
  return MemberShip;
};
