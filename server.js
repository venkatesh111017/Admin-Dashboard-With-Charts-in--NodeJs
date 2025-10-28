// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
const mongoose = require('./db'); // db.js must export a mongoose connection

// Import models
const User = require('./user');
const Sale = require('./models/Sale');
const View = require('./models/View');

// Import middleware and routes
const auth = require('./models/routes/middleware/auth');
const metricsRouter = require('./models/routes/metrics');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serves frontend (index.html)

const SECRET = process.env.JWT_SECRET || 'devsecret';


// ✅ ROUTE: User Signup
app.post('/api/Signup', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ ok: false, error: 'Email already registered.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role });

    res.json({ ok: true, message: 'User created successfully', id: newUser._id });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// ✅ ROUTE: User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET,
      { expiresIn: '8h' }
    );

    res.json({ ok: true, token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// ✅ ROUTE: Create a Sale (for testing)
app.post('/api/test/sales', auth.authenticate, async (req, res) => {
  try {
    const { amount = 100 } = req.body;
    const sale = await Sale.create({ amount, userId: req.user.id });
    res.json({ ok: true, sale });
  } catch (err) {
    console.error('Sale Error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// ✅ ROUTE: Create a View (for testing)
app.post('/api/test/views', auth.authenticate, async (req, res) => {
  try {
    const { path = '/' } = req.body;
    const view = await View.create({ path, userId: req.user.id });
    res.json({ ok: true, view });
  } catch (err) {
    console.error('View Error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// ✅ ROUTE: Get Metrics (Admin / Manager only)
app.use('/api/metrics', metricsRouter);


// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found.' });
});


// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
