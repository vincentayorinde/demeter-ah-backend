import Sequelize from 'sequelize';
import db from '../../db/models';

const { Op } = Sequelize;
let include = [{
  model: db.Category,
  as: 'category',
  attributes: ['name']
}];
const setInclude = association => [...include, association];

export const tagFilter = async (req, res, next) => {
  const { tag } = req.query;

  const tagObj = {
    model: db.Tag,
    as: 'tags',
  };

  include = setInclude(
    tag ? {
      ...tagObj,
      where: {
        name: { [Op.iLike]: `%${tag}%` }
      }
    } : tagObj
  );
  return next();
};

export const authorFilter = async (req, res, next) => {
  const { author } = req.query;
  include = setInclude({
    model: db.User,
    as: 'author',
    where:
     (author) ? {
       [Op.or]: [
         { firstName: { [Op.iLike]: `%${author}%` } },
         { lastName: { [Op.iLike]: `%${author}%` } },
         { username: { [Op.iLike]: `%${author}%` } }
       ]
     }
       : {},
    attributes: ['username', 'firstName', 'lastName']
  });
  return next();
};

export const end = async (req, res) => {
  const { title } = req.query;
  const search = await db.Article.findAll(
    {
      where: !title ? {} : { title: { [Op.iLike]: `%${title}%` } },
      include
    }
  );

  res.status(200).json({ search });
};
