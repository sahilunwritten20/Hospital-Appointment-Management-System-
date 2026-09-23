/**
 * LifeCare Hospital — Appointment Management System
 * Backend: Node.js + Express + MongoDB (Mongoose).
 *
 * Auth: signup/login with salted+hashed passwords (Node's built-in
 * crypto.scrypt — no extra npm packages needed) and opaque bearer
 * session tokens stored in MongoDB. This is a minimal implementation —
 * before using it for real patients, add HTTPS, rate limiting on
 * /api/auth/*, and a password-reset flow.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const departmentsRouter = require('./routes/departments');
const doctorsRouter = require('./routes/doctors');
const authRouter = require('./routes/auth');
const appointmentsRouter = require('./routes/appointments');
const statsRouter = require('./routes/stats');
const { runSeed } = require('./seed/seedDb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in the environment. Copy server/.env.example to server/.env and set it.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

/* ---------------------------------- API ---------------------------------- */

app.use('/api/departments', departmentsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/stats', statsRouter);

/* ------------------------- Serve the built React app ------------------------ */
// `npm run build` (see root package.json) builds client/ into client/dist.
// In production this is the only frontend the server needs to know about.

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next(err);
  });
});

/* ------------------------------ Error handler ------------------------------ */

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
});

/* --------------------------------- Startup --------------------------------- */

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await runSeed();
  console.log('Reference data ready');

  app.listen(PORT, () => {
    console.log(`LifeCare Hospital server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
