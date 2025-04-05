import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport, { AuthenticateOptions, PassportStatic } from 'passport';
import { createUser, findUserByEmail } from '../models/userModel';
import { User } from '../models/userModel';

const router = express.Router();

const createJwtToken = (user: User, res: Response): void => {
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only send over HTTPS in prod
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour in milliseconds
  });

  res.status(200).json({ user: user, message: 'Logged in' });
  return;
}

router.post('/signup', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return; 
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return; 
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(email, hashedPassword);
    await createJwtToken(user, res);
    return;
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'An error occurred during signup' });
    return; 
  }
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      console.log(err);
      return res.status(400).json({ message: err?.message || 'Authentication failed' });
    }

    return createJwtToken(user, res);
  })(req, res, next);
});

export default router;