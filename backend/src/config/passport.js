const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        let user = null;

        if (email) {
          user = await User.findOne({ where: { email } });
        }

        if (!user) {
          user = await User.findOne({ where: { google_id: profile.id } });
        }

        if (user) {
          // If user exists but google_id is not set, link the account
          if (!user.google_id) {
            user.google_id = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          // User doesn't exist, return a provisional object
          return done(null, {
            isNewGoogleUser: true,
            google_id: profile.id,
            email: email,
            full_name: profile.displayName,
          });
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
