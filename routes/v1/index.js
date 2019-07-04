import express from 'express';
import auth from './users';
import article from './articles';

const router = express.Router();

router.use('/users', auth);
router.use('/error', (req, res) => res.status(500).send({
  message: 'failed oauth'
}));
router.use('/articles', article);

export default router;
