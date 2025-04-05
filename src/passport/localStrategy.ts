import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import pool from "../config/db";
import { PassportStatic } from "passport";
import { User } from "../models/userModel";

const configureLocalStrategy = (passport: PassportStatic): void => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (
        email: string,
        password: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        done: (err: Error | null, user?: User | boolean, info?: any) => void,
      ) => {
        try {
          const res = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
          ]);
          const user = res.rows[0];
          if (!user) return done(null, false, { message: "No user found" });

          const match = await bcrypt.compare(password, user.password);
          if (!match)
            return done(null, false, { message: "Incorrect password" });

          return done(null, user);
        } catch (err: unknown) {
          if (err instanceof Error) {
            return done(err);
          }
          return done(new Error("Unknown error occurred"));
        }
      },
    ),
  );
};

export default configureLocalStrategy;
