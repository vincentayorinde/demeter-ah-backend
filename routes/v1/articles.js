import express from 'express';
import Validation from '../../validators/articles';
import Article from '../../controllers/articles';
import Middleware from '../../middlewares';
import Comment from '../../controllers/comments';
import { decodeUser } from '../../utils';

const router = express.Router();

router.post(
  '/',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.createArticle,
  Middleware.generateReadTime,
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
  '/user/:username?',
  decodeUser,
  Validation.getUserArticles,
  Article.getUserArticles
);

router.get(
  '/',
  Validation.getArticles,
  Article.getArticles,
);

router.get(
  '/:slug',
  decodeUser,
  Validation.articleSlug,
  Article.getArticle,
);

router.put(
  '/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.updateArticle,
  Middleware.generateReadTime,
  Article.updateArticle,
);

router.delete(
  '/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.articleSlug,
  Article.deleteArticle,
);

router.post(
  '/vote/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.voteArticle,
  Article.voteArticle
);

router.get(
  '/rate/:slug',
  Validation.articleSlug,
  Article.getArticleRatings,
);

router.get(
  '/rate/user/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Article.getUserArticleRating,
);

router.post(
  '/:slug/comments',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.articleSlug,
  Validation.addComment,
  Comment.addComment
);

router.post(
  '/bookmark/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.articleSlug,
  Article.bookmarkArticle,
);

router.patch(
  '/:slug/comments/:commentId',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.articleSlug,
  Validation.addComment,
  Validation.commentId,
  Comment.editComment
);

router.get(
  '/:slug/comments/:commentId/history',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.articleSlug,
  Validation.commentId,
  Comment.getCommentHistory
);

router.patch(
  '/flag/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  Validation.flagArticle,
  Article.flagArticle
);

router.delete(
  '/reported/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  Article.deleteReportedArticle
);

router.get(
  '/reported/:slug',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  Article.showArticleReports
);

router.patch(
  '/stats/:slug',
  Validation.articleSlug,
  Article.statsUpdate
);

router.post(
  '/comment/vote/:commentId',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.voteComment,
  Comment.voteComment,
);

router.get(
  '/:slug/comments',
  decodeUser,
  Validation.articleSlug,
  Comment.getComments,
);

router.get(
  '/bookmark/user',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Article.getBookmarkedArticles
);

router.get(
  '/:slug/:category/related',
  Validation.category,
  Validation.articleSlug,
  Article.getRelatedArticles,
);

export default router;
