import express from 'express';
import Validation from '../../validators/users';
import User from '../../controllers/users';
import Middleware from '../../middlewares';

const router = express.Router();

router.put('/', Middleware.authenticate, Middleware.isblackListedToken, Validation.updateUser, User.updateUser);
router.post('/signup', Validation.signUp, User.signUp);
router.post('/login', Validation.logIn, User.logIn);
router.post('/signout', Middleware.authenticate, Middleware.isblackListedToken, User.signOut);
router.post('/reset-password', Validation.resetPassword, User.resetPassword);
router.put('/change-password', Validation.changePassword, User.changePassword);
router.put('/activate/:token', User.activate);
router.get('/home', User.home);
router.get(
  '/',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  User.getUsers
);
router.post(
  '/',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  Validation.createUser,
  User.adminCreate
);
router.put(
  '/:username',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  Validation.updateUser,
  User.adminUpdate
);
router.delete(
  '/:username',
  Middleware.authenticate,
  Middleware.isblackListedToken,
  Middleware.isAdmin,
  User.adminDelete
);

export default router;
