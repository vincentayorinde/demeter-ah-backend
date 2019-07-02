import express from 'express';
import Validation from '../../validators/users';
import User from '../../controllers/users';
import Middleware from '../../middlewares';

const router = express.Router();

router.post('/signup', Validation.signUp, User.signUp);
router.post('/login', Validation.logIn, User.logIn);
router.post('/signout', Middleware.authenticate, Middleware.isblackListedToken, User.signOut);
router.post('/reset-password', Validation.resetPassword, User.resetPassword);
router.put('/change-password', Validation.changePassword, User.changePassword);

export default router;
