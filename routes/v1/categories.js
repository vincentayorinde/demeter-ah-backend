import express from 'express';
import Category from '../../controllers/categories';
import Middleware from '../../middlewares';
import Validation from '../../validators/category';

const router = express.Router();

router.post(
  '/',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  Validation.category,
  Category.addCategory
);

router.get(
  '/',
  Category.getCategories
);

export default router;
