module.exports = (sequelize, DataTypes) => {
  const BlackListedTokens = sequelize.define(
    'BlackListedTokens',
    {
      token: DataTypes.STRING,
      expireAt: DataTypes.DATE
    },
    {}
  );
  BlackListedTokens.associate = function (models) {
    // associations can be defined here
  };
  return BlackListedTokens;
};
