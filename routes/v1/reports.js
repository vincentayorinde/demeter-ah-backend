import express from 'express';
import Middleware from '../../middlewares';
import Report from '../../controllers/reports';
import Validation from '../../validators/articles';


const router = express.Router();

router.post(
  '/',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Validation.reportArticle,
  Report.reportArticle
);

router.get(
  '/articles',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  Report.getReportedArticles
);

export default router;
