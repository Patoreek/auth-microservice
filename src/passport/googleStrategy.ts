import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PassportStatic } from 'passport';
import pool from '../config/db';
import passport from 'passport'; // Already included

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user by ID, fetching all fields
passport.deserializeUser(async (id: number, done) => {
  try {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = res.rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const configureGoogleStrategy = (passport: PassportStatic) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(null, false, { message: 'No email found from Google' });
          }

          const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          let user = res.rows[0];

          if (!user) {
            // Extract firstName, lastName, and displayName from profile
            const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0];
            const lastName =
              profile.name?.familyName ||
              (profile.displayName?.split(' ').length > 1
                ? profile.displayName.split(' ').slice(1).join(' ')
                : '');
            const displayName = profile.displayName || `${firstName} ${lastName}`.trim();

            const newUser = await pool.query(
              'INSERT INTO users (email, first_name, last_name, display_name, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
              [email, firstName, lastName, displayName, 'google'],
            );
            user = newUser.rows[0];
          }

          if (user.is_twofa_enabled) {
            return done(null, { requires2FA: true, userId: user.id });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      },
    ),
  );
};

export default configureGoogleStrategy;