const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);
