import jwt from 'jsonwebtoken';
import { validations } from 'indicative';
import { Vanilla } from 'indicative/builds/formatters';
import Validator from 'indicative/builds/validator';
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

const messages = {
  required: 'Input your {{ field }}',
  min: '{{ field }} should not be less than {{ argument.0 }}',
  max: '{{ field }} should not be more than {{ argument.0 }}',
  unique: '{{ field }} already existed',
  email: 'The value provided is not an email',
  alpha: 'Only letters allowed as {{ field }}',
  alphaNumeric: 'Only letters and numbers are allowed as {{ field }}'
};

const sanitizeRules = {
  firstName: 'trim',
  lastName: 'trim',
  username: 'trim',
  email: 'trim',
  password: 'trim'
};

validations.unique = async (data, field, message, args, get) => {
  const fieldValue = get(data, field);
  if (!fieldValue) return;
  let row;
  if (args[0] === 'users') {
    row = await db.User.findOne({ where: { [field]: fieldValue } });
  }
  if (row) throw message;
};

const validatorInstance = Validator(validations, Vanilla);

const createUser = async (user) => {
  const {
    firstName, lastName, username, email, password
  } = user;

  const newUser = await db.User.create({
    firstName,
    lastName,
    username,
    email,
    password
  });

  return newUser;
};

export {
  getToken, blackListThisToken, decodeToken,
  isBlackListed, messages, validatorInstance,
  sanitizeRules, createUser
};
