import jwt from 'jsonwebtoken';

const getToken = (id, email) => jwt.sign({ id, email }, process.env.SECRET, {
  expiresIn: '5h'
});

export default getToken;
