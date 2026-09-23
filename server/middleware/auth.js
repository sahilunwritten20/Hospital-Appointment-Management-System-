const Session = require('../models/Session');
const Patient = require('../models/Patient');

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Requires a valid "Authorization: Bearer <token>" header.
// Attaches req.patient (safe, no passwordHash) and req.session.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sign in required.' });

  try {
    const session = await Session.findOne({ token });
    if (!session) {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }

    const age = Date.now() - new Date(session.createdAt).getTime();
    if (age > SESSION_TTL_MS) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }

    const patient = await Patient.findById(session.patientId);
    if (!patient) return res.status(401).json({ error: 'Account not found.' });

    req.session = session;
    req.patient = patient.toJSON();
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, SESSION_TTL_MS };
