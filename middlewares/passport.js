import passport from 'passport';
import googleStrategy from 'passport-google-oauth';
import dotenv from 'dotenv';
import db from '../db/models';

dotenv.config();
const GoogleStrategy = googleStrategy.OAuth2Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  const firstName = profile.name.givenName;
  const lastName = profile.name.familyName;
  const username = profile.displayName.replace(/ /g, '_').toLowerCase();
  const email = profile.emails[0].value;
  const image = profile.photos[0].value;

  let user = await db.User.findOne({
    where: { email }
  });

  if (!user) {
    user = await db.User.create({
      email,
      firstName,
      lastName,
      username,
      image,
      social: true
    });
  }
  return done(null, user.response());
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
