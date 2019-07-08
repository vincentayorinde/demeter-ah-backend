import express from 'express';
import auth from './users';
import article from './articles';
import profiles from './profiles';

const router = express.Router();

router.use('/users', auth);
router.use('/profiles', profiles);
router.use('/error', (req, res) => res.status(500).send({
  message: 'failed oauth'
}));
router.use('/articles', article);

export default router;
