import express from 'express';
import auth from './users';
import article from './articles';
import profiles from './profiles';
import notification from './notifications';
import members from './members';
import role from './role';
import search from './search';
import report from './reports';
import category from './categories';

const router = express.Router();

router.use('/users', auth);
router.use('/profiles', profiles);
router.use('/error', (req, res) => res.status(500).send({
  message: 'failed oauth'
}));
router.use('/articles', article);
router.use('/notifications', notification);
router.use('/members', members);
router.use('/role', role);
router.use('/search', search);
router.use('/report', report);
router.use('/category', category);

export default router;
