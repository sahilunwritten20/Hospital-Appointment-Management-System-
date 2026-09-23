// Static reference data for the hospital. Loaded into MongoDB on server
// start (see seedDb.js) — edit here and restart the server to change it.

const departments = [
  { id: 'cardiology', name: 'Cardiology', desc: 'Heart, blood pressure & vascular health', icon: 'heart' },
  { id: 'neurology', name: 'Neurology', desc: 'Brain, nerves & spinal conditions', icon: 'brain' },
  { id: 'ortho', name: 'Orthopedics', desc: 'Bones, joints & sports injuries', icon: 'bone' },
  { id: 'pediatrics', name: 'Pediatrics', desc: 'Child health & development', icon: 'baby' },
  { id: 'derma', name: 'Dermatology', desc: 'Skin, hair & nail care', icon: 'skin' },
  { id: 'ent', name: 'ENT', desc: 'Ear, nose & throat treatment', icon: 'ear' },
  { id: 'dental', name: 'Dental', desc: 'Teeth, gums & oral surgery', icon: 'tooth' },
  { id: 'general', name: 'General Medicine', desc: 'Everyday illness & checkups', icon: 'stetho' },
];

// days: 0=Sun … 6=Sat  (the weekdays each doctor consults)
const doctors = [
  { id: 1, name: 'Dr. Shourabh Gupta ', dept: 'cardiology', role: 'Senior Cardiologist', exp: 14, rating: 4.8, days: [1, 2, 3, 4, 5] },
  { id: 2, name: 'Dr. Shruti Gupta', dept: 'cardiology', role: 'Interventional Cardiologist', exp: 9, rating: 4.6, days: [1, 3, 5] },
  { id: 3, name: 'Dr. Vinayak Jadhav', dept: 'neurology', role: 'Consultant Neurologist', exp: 11, rating: 4.9, days: [2, 3, 4, 5] },
  { id: 4, name: 'Dr. Sayyad Khan', dept: 'ortho', role: 'Orthopedic Surgeon', exp: 16, rating: 4.7, days: [1, 2, 4, 5] },
  { id: 5, name: 'Dr. Khushboo Kanojiya', dept: 'ortho', role: 'Sports Medicine Specialist', exp: 7, rating: 4.5, days: [1, 2, 3, 5] },
  { id: 6, name: 'Dr. Parth Kegade', dept: 'pediatrics', role: 'Senior Pediatrician', exp: 13, rating: 4.9, days: [1, 2, 3, 4, 5] },
  { id: 7, name: 'Dr. Rohan Likhar', dept: 'derma', role: 'Consultant Dermatologist', exp: 8, rating: 4.6, days: [2, 4, 5] },
  { id: 8, name: 'Dr. Prince Jaiswal', dept: 'ent', role: 'ENT Surgeon', exp: 12, rating: 4.7, days: [1, 2, 3, 4] },
  { id: 9, name: 'Dr. Niraj Kavankar', dept: 'dental', role: 'Chief Dental Surgeon', exp: 10, rating: 4.8, days: [1, 2, 3, 4, 5] },
  { id: 10, name: 'Dr. Jaiswal', dept: 'general', role: 'General Physician', exp: 19, rating: 4.9, days: [1, 2, 3, 4, 5, 6] },
  { id: 11, name: 'Dr. Noman Khan', dept: 'ortho', role: 'Orthopedic Surgeon', exp: 16, rating: 4.7, days: [1, 2, 4, 5] },
];

module.exports = { departments, doctors };
