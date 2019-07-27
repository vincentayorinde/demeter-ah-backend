import passport from 'passport';
import googleStrategy from 'passport-google-oauth';
import dotenv from 'dotenv';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { createUserFromSocials } from '../utils';

dotenv.config();
const GoogleStrategy = googleStrategy.OAuth2Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/${process.env.GOOGLE_CALLBACK}`
    },
    async (accessToken, refreshToken, profile, done) => {
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const username = profile.displayName.replace(/ /g, '_').toLowerCase();
      const email = profile.emails[0].value;
      const image = profile.photos[0].value;

      const data = {
        email,
        firstName,
        lastName,
        username,
        image
      };

      const result = await createUserFromSocials(data);

      return done(null, result);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACk,
      profileFields: ['id', 'displayName', 'photos', 'emails', 'name']
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const lastName = profile.name.familyName.toLocaleLowerCase();
      const firstName = profile.name.givenName.toLocaleLowerCase();
      const username = profile.displayName.replace(/ /g, '_').toLocaleLowerCase();
      const image = profile.photos[0].value;

      const data = {
        email,
        firstName,
        lastName,
        username,
        image
      };

      const result = await createUserFromSocials(data);

      return done(null, result);
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACk,
      includeEmail: true
    },
    async (token, tokenSecret, profile, done) => {
      const { username } = profile;
      const image = profile.photos[0].value;
      const email = profile.emails[0].value.toLocaleLowerCase();
      const firstName = 'anonymous';
      const lastName = 'user';

      const data = {
        email,
        firstName,
        lastName,
        username,
        image
      };

      const result = await createUserFromSocials(data);

      return done(null, result);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
