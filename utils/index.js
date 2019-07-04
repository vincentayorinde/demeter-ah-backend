import jwt from 'jsonwebtoken';
import { validations } from 'indicative';
import { Vanilla } from 'indicative/builds/formatters';
import Validator from 'indicative/builds/validator';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db/models';

const getToken = (id, email) => jwt.sign({ id, email }, process.env.SECRET, {
  expiresIn: '5h',
});

const isBlackListed = async (token) => {
  const blockedToken = await db.BlackListedTokens.findOne({
    where: { token },
  });
  return !!blockedToken;
};

const decodeToken = token => jwt.verify(token, process.env.SECRET);

const blackListThisToken = async (token) => {
  const decoded = decodeToken(token);
  await db.BlackListedTokens.create({
    token,
    expireAt: decoded.exp,
  });
};

const createUserFromSocials = async (data) => {
  const {
    email, firstName, lastName, username, image
  } = data;
  let user = await db.User.findOne({
    where: { email },
  });

  if (!user) {
    user = await db.User.create({
      email,
      firstName,
      lastName,
      username,
      social: true,
      image,
    });
  }

  return user.response();
};

const messages = {
  required: 'Input your {{ field }}',
  min: '{{ field }} should not be less than {{ argument.0 }}',
  max: '{{ field }} should not be more than {{ argument.0 }}',
  unique: '{{ field }} already existed',
  email: 'The value provided is not an email',
  alpha: 'Only letters allowed as {{ field }}',
  alphaNumeric: 'Only letters and numbers are allowed as {{ field }}',
};

const sanitizeRules = {
  firstName: 'trim',
  lastName: 'trim',
  username: 'trim',
  email: 'trim',
  password: 'trim',
};

validations.unique = async (data, field, message, args, get) => {
  const fieldValue = get(data, field);
  if (!fieldValue) return;
  const row = await db[args[0]].findOne({ where: { [field]: fieldValue } });
  if (row) throw message;
};

const validatorInstance = Validator(validations, Vanilla);

const randomString = () => crypto.randomBytes(11).toString('hex');

const hashPassword = password => bcrypt.hash(password, 10);

export {
  getToken,
  blackListThisToken,
  decodeToken,
  isBlackListed,
  messages,
  validatorInstance,
  sanitizeRules,
  randomString,
  hashPassword,
  createUserFromSocials,
};
