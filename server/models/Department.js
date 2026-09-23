const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    desc: { type: String, default: '' },
    icon: { type: String, default: 'info' },
    // Preserves display order from seed/seedData.js (Mongo doesn't
    // guarantee natural insertion order on find()).
    order: { type: Number, default: 0 },
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

module.exports = mongoose.model('Department', departmentSchema);
