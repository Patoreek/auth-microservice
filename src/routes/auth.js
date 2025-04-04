const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { createUser, findUserByEmail } = require('../models/userModel');
const router = express.Router();

const createJwtToken = (user, res) => {
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only send over HTTPS in prod
        sameSite: 'strict', 
        maxAge: 3600000, // 1 hour in milliseconds
    });
    
    return res.status(200).json({ user: user, message: 'Logged in' });
}

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser(email, hashedPassword);
      return createJwtToken(user, res);
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ message: 'An error occurred during signup' });
    }
  });

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            console.log(err);
            return res.status(400).json({ message: err?.message || 'Authentication failed' });
          }

        return createJwtToken(user, res);
    })(req, res, next);
});

module.exports = router;