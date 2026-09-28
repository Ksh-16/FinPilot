const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const normalizedName =
    typeof name === 'string' ? name.trim() : '';

  const normalizedEmail =
    typeof email === 'string'
      ? email.trim().toLowerCase()
      : '';

  if (!normalizedName || !normalizedEmail || !password) {
    return res.status(400).json({
      error: 'Name, email and password are required.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters.'
    });
  }

  try {
    const existing = await User.findOne({
      email: normalizedEmail
    });

    if (existing) {
      return res.status(409).json({
        error: 'An account with this email already exists.'
      });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user
    });
  } catch (e) {
    console.error('Registration error:', e);

    res.status(500).json({
      error: 'Registration failed.'
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  const normalizedEmail =
    typeof email === 'string'
      ? email.trim().toLowerCase()
      : '';

  if (!normalizedEmail || !password) {
    return res.status(400).json({
      error: 'Email and password are required.'
    });
  }

  try {
    const user = await User.findOne({
      email: normalizedEmail
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user
    });
  } catch (e) {
    console.error('Login error:', e);

    res.status(500).json({
      error: 'Login failed.'
    });
  }
}

async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };
