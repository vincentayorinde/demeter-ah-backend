import express from 'express';
import dotenv from 'dotenv';
import passport from '../../middlewares/passport';
import { encryptQuery } from '../../utils';

dotenv.config();

const router = express.Router();

const redirect = (req, res) => res.redirect(`${process.env.FRONTEND_STAGING_URL}/#/signin?token=${encryptQuery(req.user.token)}&username=${req.user.username}`);

// google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/v1/error'
  }),
  /* istanbul ignore next */
  redirect
);

// facebook login
router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/api/v1/error'
  }),
  /* istanbul ignore next */
  redirect
);

// twiiter login
router.get('/twitter', passport.authenticate('twitter', { scope: ['include_email=true'] }));
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    failureRedirect: '/api/v1/error'
  }),
  /* istanbul ignore next */
  redirect
);

export default router;
