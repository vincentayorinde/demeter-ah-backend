import express from 'express';
import Validation from '../../validators/users';
import Controller from '../../controllers/users';
import Middleware from '../../middlewares';

const router = express.Router();

router.post('/signup', Validation.signUp, Controller.signUp);
router.post('/login', Validation.logIn, Controller.logIn);
router.post('/signout', Middleware.authenticate, Middleware.isblackListedToken, Controller.signOut);

export default router;
