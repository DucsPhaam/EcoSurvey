// Passport config: Configures Google OAuth 2.0 authentication strategy.
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

// Fail fast in production if Google OAuth credentials are not configured.
if (process.env.NODE_ENV === 'production') {
  if (!process.env.GOOGLE_CLIENT_ID) throw new Error('[passport] Missing required environment variable: GOOGLE_CLIENT_ID');
  if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error('[passport] Missing required environment variable: GOOGLE_CLIENT_SECRET');
}

// Fallback placeholders are intentional for development (devs may not configure OAuth locally).
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
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
          // Link Google OAuth ID if user exists without google_id.
          if (!user.google_id) {
            user.google_id = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          // Return temp Google profile for registration if user does not exist.
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
