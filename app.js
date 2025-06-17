const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const SequelizeStore = require('connect-pg-simple')(session);
const sequelize = require('./config/database');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const messageRoutes = require('./routes/messages');
const expressLayouts = require('express-ejs-layouts'); 
require('dotenv').config();

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main'); 
app.use(expressLayouts); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(
  session({
    store: new SequelizeStore({
      db: sequelize,
      tableName: 'Session',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});