import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import pool from '../config/db';
import { PassportStatic } from 'passport';

const configureLocalStrategy = (passport: PassportStatic): void => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email: string, password: string, done: (err: any, user?: any, info?: any) => void) => {
      try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = res.rows[0];
        if (!user) return done(null, false, { message: 'No user found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
};

export default configureLocalStrategy;