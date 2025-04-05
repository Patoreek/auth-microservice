import express from "express";
import expressSession from "express-session";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import initializePassport from "./passport/localStrategy";
import configureGoogleStrategy from "./passport/googleStrategy";
import verify2FA from "./passport/verify2FA"; // Import verify2FA route
import authenticate, { AuthenticatedRequest } from "./middlewares/authenticate";

dotenv.config();

const app = express();
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET!, // Set your session secret (preferably from .env)
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production for secure cookies
      maxAge: 1000 * 60 * 60 * 24, // Example: 1 day
    },
  }),
);

initializePassport(passport);
configureGoogleStrategy(passport);

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Your frontend's origin
    credentials: true, // Allow cookies to be sent
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/auth", verify2FA);
// Example protected route
app.get(
  "/api/protected",
  authenticate,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req: AuthenticatedRequest, res: any) => {
    return res.json({ message: "You are authorized!", user: req.user });
  },
);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
