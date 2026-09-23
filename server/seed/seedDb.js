const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Meta = require('../models/Meta');
const { departments, doctors } = require('./seedData');
const { timeSlots, hashCode } = require('../utils/time');

// Upserts departments & doctors from seedData.js into MongoDB. Safe to run
// on every boot — it just keeps the reference collections in sync with the
// seed file.
async function seedReferenceData() {
  await Promise.all(
    departments.map((dept, i) => Department.updateOne({ id: dept.id }, { $set: { ...dept, order: i } }, { upsert: true }))
  );
  await Promise.all(doctors.map((doc) => Doctor.updateOne({ id: doc.id }, { $set: doc }, { upsert: true })));
}

// Seeds a handful of background appointments (isDemo: true, no patientId)
// so doctors' calendars aren't empty on a fresh database. Only ever runs
// once — guarded by a "seeded" flag in the Meta collection.
async function seedDemoAppointments() {
  const meta = await Meta.findOne({ key: 'seeded' });
  if (meta && meta.value) return;

  const names = ['Riya S.', 'Aditya K.', 'Fatima Z.', 'Wei L.', 'Carlos M.', 'Grace O.', 'Tom H.', 'Sara P.'];
  const slots = timeSlots();
  const today = new Date();
  const toInsert = [];

  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const iso = date.toISOString().slice(0, 10);
    const weekday = date.getDay();

    doctors.forEach((doc) => {
      if (!doc.days.includes(weekday)) return;
      const seedVal = hashCode(`${doc.id}-${dayOffset}`);
      const count = seedVal % 5; // 0-4 pre-filled slots
      for (let i = 0; i < count; i++) {
        const idx = (seedVal + i * 3) % slots.length;
        toInsert.push({
          patientId: null,
          patientName: names[(seedVal + i) % names.length],
          doctorId: doc.id,
          date: iso,
          time: slots[idx],
          reason: 'Consultation',
          status: 'upcoming',
          isDemo: true,
        });
      }
    });
  }

  if (toInsert.length) await Appointment.insertMany(toInsert);
  await Meta.updateOne({ key: 'seeded' }, { $set: { value: true } }, { upsert: true });
}

async function runSeed() {
  await seedReferenceData();
  await seedDemoAppointments();
}

module.exports = { runSeed };
