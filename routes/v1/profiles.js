import express from 'express';
import User from '../../controllers/profiles';

const router = express.Router();

router.get('/:username', User.getProfile);

export default router;
