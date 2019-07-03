import express from 'express';
import passport from '../../middlewares/passport';

const router = express.Router();

router.get('/', passport.authenticate('facebook', { scope: 'email' }));
router.get('/oauth', passport.authenticate('twitter', { scope: ['include_email=true'] }));

router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/api/v1/error'
  }),
  (req, res) => res.status(200).send({
    u: req.user
  })
);

router.get(
  '/callback/twt',
  passport.authenticate('twitter', {
    failureRedirect: '/api/v1/error'
  }),
  (req, res) => res.status(200).json({
    u: req.user
  })
);

export default router;
