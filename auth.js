// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

const app = express();
const port = 8000;

app.use(express.json());

// Registration route
router.post('/register', (req, res) => {
  // Create a new user and save it to the database
});

// Login route
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login successful' });
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logout successful' });
});

module.exports = router;
