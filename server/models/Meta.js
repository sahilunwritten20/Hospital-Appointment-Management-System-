const mongoose = require('mongoose');

// Tiny key/value store for one-off flags, e.g. { key: 'seeded', value: true }
const metaSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model('Meta', metaSchema);
