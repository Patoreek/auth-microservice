const express = require('express');
const cors = require('cors');
const passport = require('passport');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const initializePassport = require('./passport/localStrategy');
const cookieParser = require('cookie-parser');
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
const authenticate = require('./middlewares/authenticate');
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'You are authorized!', user: req.user });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));