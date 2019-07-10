import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { validations } from 'indicative';
import { Vanilla } from 'indicative/builds/formatters';
import Validator from 'indicative/builds/validator';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db/models';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

export const uploadImage = (img, publicId) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload(img.tempFilePath,
    { public_id: publicId }, (err, res) => (err ? reject(err) : resolve(res.url)));
});

export const deleteImage = publicId => new Promise((resolve, reject) => {
  cloudinary.uploader.destroy(publicId, (err, res) => (err ? reject(err) : resolve(res.url)));
});

export const getToken = (id, email) => jwt.sign({ id, email }, process.env.SECRET, {
  expiresIn: '5h',
});

export const isBlackListed = async (token) => {
  const blockedToken = await db.BlackListedTokens.findOne({
    where: { token },
  });
  return !!blockedToken;
};

export const decodeToken = token => jwt.verify(token, process.env.SECRET);

export const blackListThisToken = async (token) => {
  const decoded = decodeToken(token);
  await db.BlackListedTokens.create({
    token,
    expireAt: decoded.exp,
  });
};

export const createUserFromSocials = async (data) => {
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

export const messages = {
  required: 'Input your {{ field }}',
  required_with_any: 'You have to provide a {{ field }} for any {{ argument.0 }}',
  min: '{{ field }} should not be less than {{ argument.0 }}',
  max: '{{ field }} should not be more than {{ argument.0 }}',
  unique: '{{ field }} already existed',
  email: 'The value provided is not an email',
  string: '{{ feild }} must be a string',
  integer: '{{ feild }} must be an integer',
  alpha: 'Only letters allowed as {{ field }}',
  alphaNumeric: 'Only letters and numbers are allowed as {{ field }}',
  range: 'Only ratings from 1 to 5 are allowed'
};

export const sanitizeRules = {
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

export const validatorInstance = Validator(validations, Vanilla);

export const createUser = async (user) => {
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

export const randomString = () => crypto.randomBytes(11).toString('hex');

export const hashPassword = password => bcrypt.hash(password, 10);

export const getMembers = async (user, follow, id) => {
  const result = await db.User.findOne({
    where: {
      id,
    },
    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'image'],
    include: [{
      model: db.MemberShip,
      as: user,
      include: [{
        model: db.User,
        as: follow,
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'image']
      }]
    }]
  });
  return result;
};

export const findRatedArticle = async ratingParams => db.Article.findOne(ratingParams);

export const avgRating = async (articleId) => {
  let avg = await (db.Ratings.findOne({
    where: { articleId },
    attributes: [[db.sequelize.fn('AVG',
      db.sequelize.col('stars')), 'avgRating']],
    group: ['articleId'],
    order: [[db.sequelize.fn('AVG', db.sequelize.col('stars')), 'DESC']]
  }));
  avg = parseFloat(avg.dataValues.avgRating).toFixed(2);
  return avg;
};

export const storeRating = async (foundArticleId) => {
  const articleAvg = await avgRating(foundArticleId);
  const getArticle = await db.Article.findOne({
    where: { id: foundArticleId },
  });
  getArticle.update({
    rating: parseFloat(articleAvg).toFixed(2)
  });
};
