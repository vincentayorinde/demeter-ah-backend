import express from 'express';
import * as Search from '../../controllers/search';
import Validator from '../../validators/search';

const router = express.Router();

router.get('/',
  Validator.search,
  Search.tagFilter,
  Search.authorFilter,
  Search.end);

export default router;
