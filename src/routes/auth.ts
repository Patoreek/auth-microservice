import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { createUser, findUserByEmail } from "../models/userModel";
import { User } from "../models/userModel";

const router = express.Router();

const createJwtToken = (user: User, res: Response): string => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1h",
    },
  );

  // Set token in a cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
  });
  
  return token;
};

router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const { email, password, firstName, lastName} = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(email, firstName, lastName, hashedPassword);
    if (!user) return;
    await createJwtToken(user, res);
    res.status(200).json({ message: "User Signed up!", user: user });
    return;
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "An error occurred during signup" });
    return;
  }
});

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: Error, user: User) => {
      if (err || !user) {
        console.log(err);
        return res
          .status(400)
          .json({ message: err?.message || "Authentication failed" });
      }

      createJwtToken(user, res);
      res.status(200).json({ message: "User Logged In!", user: user });
    },
  )(req, res, next);
});

// Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }), // Disable sessions
  (req: Request, res: Response) => {
    if (!req.user) {
      return res.redirect('/api/auth/failure');
    }

    const user = req.user as User;
    const token = createJwtToken(user, res);

    // Redirect to success with token (optional, if you prefer query param)
    res.redirect(`/api/auth/success?token=${token}`);
  },
);

router.get('/success', (req: Request, res: Response): void => {
  // Option 1: Get token from cookie
  const token = req.cookies.token;

  // Option 2: Get token from query parameter
  // const token = req.query.token as string;

  if (!token) {
    res.status(401).json({ message: 'No authentication token provided' });
    return; 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      email: string;
    };
    // Optionally fetch user from database using decoded.id or decoded.email
    res.json({ message: 'Google login success', user: decoded });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/failure', (req: Request, res: Response) => {
  res.status(401).json({ message: 'Google login failed' });
});


export default router;
