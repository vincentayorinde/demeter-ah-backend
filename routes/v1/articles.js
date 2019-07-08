import express from 'express';
import Validation from '../../validators/articles';
import Article from '../../controllers/articles';
import Middleware from '../../middlewares';

const router = express.Router();

router.post(
  '/',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.createArticle,
  Article.createArticle,
);
router.post(
  '/rate/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.rateArticle,
  Article.rateArticle,
);

export default router;
