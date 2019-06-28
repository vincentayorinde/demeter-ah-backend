import jwt from 'jsonwebtoken';
import db from '../db/models';

const getToken = (id, email) => jwt.sign({ id, email }, process.env.SECRET, {
  expiresIn: '5h'
});

const isBlackListed = async (token) => {
  const blockedToken = await db.BlackListedTokens.findOne({
    where: { token }
  });
  return !!blockedToken;
};

const decodeToken = token => jwt.verify(token, process.env.SECRET);

const blackListThisToken = async (token) => {
  const decoded = decodeToken(token);
  await db.BlackListedTokens.create({
    token,
    expireAt: decoded.exp
  });
};

export {
  getToken, blackListThisToken, decodeToken, isBlackListed
};
