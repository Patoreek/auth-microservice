import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PassportStatic } from "passport";
import pool from "../config/db";
import passport from "passport"; // Add this import

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
  // Here, we're serializing the user by saving their id or any identifier you want
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = res.rows[0];
    done(null, user); // Pass the user object into the session
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
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email)
            return done(null, false, { message: "No email found from Google" });

          const res = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
          ]);
          let user = res.rows[0];

          if (!user) {
            // Optional: Create user if not exists
            const newUser = await pool.query(
              "INSERT INTO users (email, name, provider) VALUES ($1, $2, $3) RETURNING *",
              [email, profile.displayName, "google"],
            );
            user = newUser.rows[0];
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
