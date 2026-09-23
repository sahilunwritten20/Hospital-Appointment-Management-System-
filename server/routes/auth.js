const router = require('express').Router();
const crypto = require('crypto');
const Patient = require('../models/Patient');
const Session = require('../models/Session');
const { requireAuth } = require('../middleware/auth');
const { hashPassword, verifyPassword } = require('../utils/password');

// Create a new patient account.
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await Patient.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Try logging in instead.' });
    }

    const patient = await Patient.create({
      name,
      email,
      phone: phone || '',
      passwordHash: hashPassword(password),
    });

    const token = crypto.randomBytes(32).toString('hex');
    await Session.create({ token, patientId: patient._id });

    res.status(201).json({ token, patient: patient.toJSON() });
  } catch (err) {
    next(err);
  }
});

// Log in with an existing account.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const patient = await Patient.findOne({ email: String(email).toLowerCase() });

    // Same error for "no such account" and "wrong password" — don't reveal
    // which one it was, so the API can't be used to enumerate emails.
    if (!patient || !verifyPassword(password, patient.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    await Session.create({ token, patientId: patient._id });

    res.json({ token, patient: patient.toJSON() });
  } catch (err) {
    next(err);
  }
});

// Restore a session on page load (validate a stored token).
router.get('/me', requireAuth, (req, res) => {
  res.json({ patient: req.patient });
});

// Log out — invalidate just this one session token.
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await Session.deleteOne({ _id: req.session._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
