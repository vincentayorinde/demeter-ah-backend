import express from 'express';
import auth from './users';
import oauth from './oauth';

const router = express.Router();

router.use('/users', auth);
router.use('/auth', oauth);

export default router;
