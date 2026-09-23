const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    // "salt:hash" hex string produced by crypto.scrypt — see utils/password.js
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // never send the password hash to the client
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Patient', patientSchema);
