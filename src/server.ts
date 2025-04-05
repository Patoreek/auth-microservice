import express, { Response, NextFunction } from 'express';
import cors from 'cors';
import passport from 'passport';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import initializePassport from './passport/localStrategy';
import authenticate, { AuthenticatedRequest } from './middlewares/authenticate';

dotenv.config();

const app = express();
initializePassport(passport);

app.use(cors({
    origin: process.env.FRONTEND_URL, // Your frontend's origin
    credentials: true, // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
// Example protected route
app.get('/api/protected', authenticate, (req: AuthenticatedRequest, res: any) => {
  return res.json({ message: 'You are authorized!', user: req.user });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));