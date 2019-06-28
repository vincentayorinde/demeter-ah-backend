import jwt from 'jsonwebtoken';

const getActivationToken = email => jwt.sign({ email }, process.env.SECRET, {
  expiresIn: '72h'
});

const decodeToken = token => jwt.verify(token, process.env.SECRET);

export default { getActivationToken, decodeToken };
