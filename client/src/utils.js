export const avatarColors = ['#0B2A4A', '#1B5FAE', '#3E7FC4', '#6FA3D8'];

export function initials(name) {
  return name
    .replace('Dr. ', '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function fmtISO(d) {
  return d.toISOString().slice(0, 10);
}

export function to12h(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}

export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
