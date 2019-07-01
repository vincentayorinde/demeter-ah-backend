import express from 'express';
import auth from './users';

const router = express.Router();

router.use('/users', auth);

export default router;
