const router = require('express').Router();
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const { todayISO } = require('../utils/time');

router.get('/', async (req, res, next) => {
  try {
    const today = todayISO();
    const weekday = new Date().getDay();

    const [totalDoctors, totalDepartments, todayCount, doctorsToday] = await Promise.all([
      Doctor.countDocuments(),
      Department.countDocuments(),
      Appointment.countDocuments({ date: today, status: { $ne: 'cancelled' } }),
      Doctor.countDocuments({ days: weekday }),
    ]);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      // eslint-disable-next-line no-await-in-loop
      const count = await Appointment.countDocuments({ date: iso, status: { $ne: 'cancelled' } });
      week.push({ date: iso, label: d.toLocaleDateString('en-US', { weekday: 'short' }), count });
    }

    res.json({ totalDoctors, totalDepartments, todayCount, doctorsToday, week });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
