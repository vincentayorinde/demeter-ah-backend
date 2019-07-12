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
router.get(
  '/:slug',
  Validation.articleSlug,
  Article.getArticle,
);
router.put(
  '/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.updateArticle,
  Article.updateArticle,
);
router.delete(
  '/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.articleSlug,
  Article.deleteArticle,
);

router.post('/vote/:slug', Middleware.authenticate, Middleware.isblackListedToken, Article.voteArticle);

router.get(
  '/rate/:slug',
  Validation.articleSlug,
  Article.getArticleRatings,
);

export default router;
