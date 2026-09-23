const router = require('express').Router();
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const { timeSlots } = require('../utils/time');

router.get('/', async (req, res, next) => {
  try {
    const { dept, search } = req.query;
    const query = {};
    if (dept && dept !== 'all') query.dept = dept;

    let list = await Doctor.find(query).sort({ id: 1 });

    if (search) {
      const term = String(search).toLowerCase();
      const depts = await Department.find();
      const deptNameById = Object.fromEntries(depts.map((d) => [d.id, d.name]));
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.role.toLowerCase().includes(term) ||
          (deptNameById[d.dept] || '').toLowerCase().includes(term)
      );
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Doctor.findOne({ id: Number(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// Availability for a doctor on a given date.
router.get('/:id/availability', async (req, res, next) => {
  try {
    const doc = await Doctor.findOne({ id: Number(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });

    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param is required (YYYY-MM-DD)' });

    const weekday = new Date(`${date}T00:00:00`).getDay();
    const works = doc.days.includes(weekday);

    const booked = await Appointment.find({
      doctorId: doc.id,
      date,
      status: { $ne: 'cancelled' },
    }).select('time -_id');
    const bookedTimes = booked.map((b) => b.time);

    const slots = timeSlots().map((time) => ({
      time,
      available: works && !bookedTimes.includes(time),
    }));

    res.json({ works, slots });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
