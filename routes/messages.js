const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const router = express.Router();

// Middleware to ensure user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
};

// Create message route
router.get('/create', isAuthenticated, (req, res) => {
  res.render('createMessage', { errors: [], user: req.user });
});

router.post(
  '/create',
  isAuthenticated,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('text').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('createMessage', { errors: errors.array(), user: req.user });
    }

    try {
      const { title, text } = req.body;
      await Message.create({
        title,
        text,
        userId: req.user.id,
      });
      res.redirect('/');
    } catch (error) {
      res.render('createMessage', { errors: [{ msg: 'Server error' }], user: req.user });
    }
  }
);

// Delete message route
router.post('/delete/:id', isAuthenticated, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect('/');
  }

  try {
    await Message.destroy({ where: { id: req.params.id } });
    res.redirect('/');
  } catch (error) {
    res.redirect('/');
  }
});

module.exports = router;