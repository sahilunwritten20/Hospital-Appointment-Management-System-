const router = require('express').Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { requireAuth } = require('../middleware/auth');
const { todayISO } = require('../utils/time');

/* All routes below (except /today) require a valid session, and every
   read/write is scoped to req.patient.id — a patient can only ever see
   or modify their own appointments (ownership is checked below even
   when the id in the URL is guessed/enumerated). */

// The logged-in patient's own appointments.
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await Appointment.find({ patientId: req.patient.id }).sort({ date: 1, time: 1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Public: today's appointments across all patients, for the dashboard's
// aggregate "Today's schedule" widget.
router.get('/today', async (req, res, next) => {
  try {
    const date = req.query.date || todayISO();
    const list = await Appointment.find({ date, status: { $ne: 'cancelled' } });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { doctorId, date, time, reason } = req.body || {};
    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'doctorId, date and time are required' });
    }

    const doc = await Doctor.findOne({ id: Number(doctorId) });
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });

    const weekday = new Date(`${date}T00:00:00`).getDay();
    if (!doc.days.includes(weekday)) {
      return res.status(409).json({ error: 'This doctor does not consult on the selected date' });
    }

    const clash = await Appointment.findOne({
      doctorId: Number(doctorId),
      date,
      time,
      status: { $ne: 'cancelled' },
    });
    if (clash) {
      return res.status(409).json({ error: 'That slot was just taken. Please pick another time.' });
    }

    const appointment = await Appointment.create({
      patientId: req.patient.id,
      patientName: req.patient.name,
      doctorId: Number(doctorId),
      date,
      time,
      reason: reason || 'General consultation',
      status: 'upcoming',
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

// Reschedule — only the owning patient may do this.
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { date, time } = req.body || {};
    if (!date || !time) return res.status(400).json({ error: 'date and time are required' });

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (!appt.patientId || appt.patientId.toString() !== req.patient.id) {
      return res.status(403).json({ error: 'You can only manage your own appointments.' });
    }
    if (appt.status !== 'upcoming') {
      return res.status(409).json({ error: 'Only upcoming appointments can be rescheduled' });
    }

    const doc = await Doctor.findOne({ id: appt.doctorId });
    const weekday = new Date(`${date}T00:00:00`).getDay();
    if (!doc.days.includes(weekday)) {
      return res.status(409).json({ error: 'This doctor does not consult on the selected date' });
    }

    const clash = await Appointment.findOne({
      _id: { $ne: appt._id },
      doctorId: appt.doctorId,
      date,
      time,
      status: { $ne: 'cancelled' },
    });
    if (clash) return res.status(409).json({ error: 'That slot is already taken. Please pick another time.' });

    appt.date = date;
    appt.time = time;
    await appt.save();
    res.json(appt);
  } catch (err) {
    next(err);
  }
});

// Cancel — only the owning patient may do this.
router.put('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (!appt.patientId || appt.patientId.toString() !== req.patient.id) {
      return res.status(403).json({ error: 'You can only manage your own appointments.' });
    }

    appt.status = 'cancelled';
    await appt.save();
    res.json(appt);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
