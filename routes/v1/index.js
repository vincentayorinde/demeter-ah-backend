import express from 'express';
import auth from './users';
import OAuth from './oauth';

const router = express.Router();

router.use('/users', auth);
router.use('/facebook', OAuth);
router.use('/twitter', OAuth);
router.use('/error', (req, res) => res.status(500).send({
  message: 'failed oauth'
}));

export default router;
