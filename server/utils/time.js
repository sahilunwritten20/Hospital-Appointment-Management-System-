function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// 09:00–17:00, 30-minute slots, lunch break at 13:00
function timeSlots() {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    if (h === 13) continue;
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

// Small deterministic string hash used only to pick believable demo data.
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

module.exports = { todayISO, timeSlots, hashCode };
