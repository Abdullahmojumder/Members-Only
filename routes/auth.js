const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Signup route
router.get('/signup', (req, res) => {
  res.render('signup', { errors: [], user: req.user });
});

router.post(
  '/signup',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    body('isAdmin').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('signup', { errors: errors.array(), user: req.user });
    }

    try {
      const { firstName, lastName, email, password, isAdmin } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.render('signup', { errors: [{ msg: 'Email already in use' }], user: req.user });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isAdmin: isAdmin === 'on',
      });
      res.redirect('/auth/login');
    } catch (error) {
      res.render('signup', { errors: [{ msg: 'Server error' }], user: req.user });
    }
  }
);

// Login route
router.get('/login', (req, res) => {
  res.render('login', { errors: [], user: req.user });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: false,
}));

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Join club route
router.get('/join', (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  res.render('joinClub', { errors: [], user: req.user });
});

router.post('/join', async (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }

  const { passcode } = req.body;
  if (passcode === process.env.CLUB_PASSCODE) {
    await User.update({ isMember: true }, { where: { id: req.user.id } });
    res.redirect('/');
  } else {
    res.render('joinClub', { errors: [{ msg: 'Incorrect passcode' }], user: req.user });
  }
});

module.exports = router;