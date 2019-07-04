import express from 'express';
import auth from './users';
import oauth from './oauth';

const router = express.Router();

router.use('/users', auth);
router.use('/auth', oauth);
router.use('/facebook', oauth);
router.use('/twitter', oauth);
router.use('/error', (req, res) => res.status(500).send({
  message: 'failed oauth'
}));

export default router;
