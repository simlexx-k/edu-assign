const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { csrfProtection } = require('./middleware/securityMiddleware'); // Import CSRF protection middleware
const router = express.Router();

router.get('/auth/register', csrfProtection, (req, res) => {
  res.render('register', { _csrf: req.csrfToken() }); // Pass CSRF token to the view
});

router.post('/auth/register', csrfProtection, async (req, res) => {
  try {
    const { username, password, email, role } = req.body; // Include email in the request body
    // User model will automatically hash the password using bcrypt
    const newUser = await User.create({ username, password, email, role }); // Save email along with other user information
    console.log(`New user registered: ${newUser.username}, Role: ${newUser.role}`);
    req.session.userRole = newUser.role; // Store the user's role in the session
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    console.error(error.stack);
    res.status(500).send(error.message);
  }
});

router.get('/auth/login', csrfProtection, (req, res) => {
  res.render('login', { _csrf: req.csrfToken(), error: null }); // Pass CSRF token to the view and initialize error as null
});

router.post('/auth/login', csrfProtection, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Login attempt failed: User not found');
      return res.render('login', { error: 'Invalid username or password', _csrf: req.csrfToken() }); // Render login page with error message
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      req.session.userRole = user.role; // Store the user's role in the session
      console.log(`User logged in: ${user.username}`);
      return res.redirect('/');
    } else {
      console.log('Login attempt failed: Password is incorrect');
      return res.render('login', { error: 'Invalid username or password', _csrf: req.csrfToken() }); // Render login page with error message
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error(error.stack);
    return res.status(500).send(error.message);
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      console.error(err.stack);
      return res.status(500).send('Error logging out');
    }
    console.log('User logged out successfully');
    res.redirect('/auth/login');
  });
});

module.exports = router;