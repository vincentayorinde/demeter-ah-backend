import express from 'express';
import User from '../../controllers/users';
import Middleware from '../../middlewares';

const router = express.Router();

router.patch('/email-notify', Middleware.authenticate, Middleware.isblackListedToken, User.changeEmailNotification);
router.patch('/app-notify', Middleware.authenticate, Middleware.isblackListedToken, User.changeInAppNotification);
router.get('/', Middleware.authenticate, Middleware.isblackListedToken, User.getNotifications);
router.patch('/:id', Middleware.authenticate, Middleware.isblackListedToken, User.readNotification);

export default router;
