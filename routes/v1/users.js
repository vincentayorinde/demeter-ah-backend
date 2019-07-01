import express from 'express';
import Validation from '../../validators/users';
import Controller from '../../controllers/users';

const router = express.Router();

router.post('/signup', Validation.signUp, Controller.signUp);
router.post('/login', Validation.logIn, Controller.logIn);

export default router;
