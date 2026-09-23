const crypto = require('crypto');

// Password hashing: scrypt with a random salt, stored as "salt:hash" hex.
// No third-party auth library needed.
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hashHex] = stored.split(':');
  const hashBuffer = Buffer.from(hashHex, 'hex');
  const suppliedBuffer = crypto.scryptSync(password, salt, 64);
  // timingSafeEqual requires equal-length buffers
  if (hashBuffer.length !== suppliedBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, suppliedBuffer);
}

module.exports = { hashPassword, verifyPassword };
