const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const router = express.Router();

router.get('/', async (req, res) => {
  const messages = await Message.findAll({
    include: [{ model: User, attributes: ['firstName', 'lastName', 'isMember', 'isAdmin'] }],
    order: [['timestamp', 'DESC']],
  });
  res.render('home', { messages, user: req.user });
});

module.exports = router;