import express from 'express';
import Members from '../../controllers/membership';
import Middleware from '../../middlewares';
import Validation from '../../validators/membership';

const router = express.Router();

router.post('/', Middleware.authenticate, Middleware.isblackListedToken, Validation.follow, Members.createFollowing);
router.get('/following', Middleware.authenticate, Middleware.isblackListedToken, Members.getFollowing);
router.get('/followers', Middleware.authenticate, Middleware.isblackListedToken, Members.getFollowers);

export default router;
