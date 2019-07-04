import express from 'express';
import passport from '../../middlewares/passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/api/v1/auth/error'
}), (req, res) => {
  res.status(200).json(req.user);
});

router.get('/error', (req, res) => res.json({
  message: 'Google signup failed'
}));

export default router;
