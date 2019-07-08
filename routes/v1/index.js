import express from 'express';
import auth from './users';

const router = express.Router();

router.use('/users', auth);
router.use('/error', (req, res) => res.status(500).send({
  message: 'failed oauth'
}));

export default router;
