const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    dept: { type: String, required: true }, // Department.id
    role: { type: String, required: true },
    exp: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    // 0=Sun … 6=Sat — the weekdays this doctor consults
    days: { type: [Number], default: [] },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
