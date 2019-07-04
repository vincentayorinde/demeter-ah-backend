import express from 'express';
import passport from '../../middlewares/passport';

const router = express.Router();

// google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/v1/error'
  }),
  (req, res) => res.redirect('/api/v1/users/home')
);

// facebook login
router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/api/v1/error'
  }),
  (req, res) => res.redirect('/api/v1/users/home')
);

// twiiter login
router.get('/twitter', passport.authenticate('twitter', { scope: ['include_email=true'] }));
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    failureRedirect: '/api/v1/error'
  }),
  (req, res) => res.redirect('/api/v1/users/home')
);

export default router;
