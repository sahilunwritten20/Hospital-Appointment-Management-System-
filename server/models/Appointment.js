const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    // null for the background "demo" appointments seeded so doctors'
    // calendars aren't empty on first run (see seed/seedDb.js).
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
    patientName: { type: String, required: true },
    doctorId: { type: Number, required: true }, // Doctor.id
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:MM (24h)
    reason: { type: String, default: 'General consultation' },
    status: { type: String, enum: ['upcoming', 'cancelled', 'completed'], default: 'upcoming' },
    isDemo: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        if (ret.patientId) ret.patientId = ret.patientId.toString();
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
