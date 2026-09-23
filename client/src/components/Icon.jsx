import React from 'react';

export const ICONS = {
  heart: '<path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2 4.5 5.6 4c2-.3 3.7.6 4.9 2.2L12 8l1.5-1.8C14.7 4.6 16.4 3.7 18.4 4c3.6.5 5.2 4.1 3.6 7.7C19.5 16.4 12 21 12 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>',
  brain: '<path d="M9 4a3 3 0 00-3 3 3 3 0 00-1 5.8A3.5 3.5 0 007 18h1M15 4a3 3 0 013 3 3 3 0 011 5.8A3.5 3.5 0 0117 18h-1M9 4v14M15 4v14M9 8h2M13 8h2M9 12h2M13 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
  bone: '<path d="M6.5 4.5a2 2 0 10-2.7 2.9L14.6 18.2a2 2 0 102.7-2.9L6.5 4.5z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="5" cy="5.2" r="1.6" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="19" cy="18.8" r="1.6" stroke="currentColor" stroke-width="1.4" fill="none"/>',
  baby: '<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M6 21c0-4 2.7-6 6-6s6 2 6 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  skin: '<path d="M12 3c4 3 7 7 7 11a7 7 0 01-14 0c0-4 3-8 7-11z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
  ear: '<path d="M14 4a6 6 0 00-6 6c0 2 1 3 1 5a3 3 0 003 3 2 2 0 002-2v-1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M14 4a6 6 0 016 6c0 3-2 4-3 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  tooth: '<path d="M8 3c-2.5 0-4 2-4 4.5 0 3 1 5 1.5 8s1 5.5 2.7 5.5 1.8-4 2-6 .6-3 1.8-3 1.6 1.8 1.8 3 .3 6 2 6 2.2-2.5 2.7-5.5 1.5-5 1.5-8c0-2.5-1.5-4.5-4-4.5-1.3 0-2 .7-3 .7S9.3 3 8 3z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>',
  stetho: '<path d="M6 4v5a4 4 0 008 0V4M10 15v2a5 5 0 0010 0v-2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="20" cy="17" r="1.8" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="6" cy="4" r="1.3" fill="currentColor"/><circle cx="14" cy="4" r="1.3" fill="currentColor"/>',
  star: '<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7-5.4-4.7 7.1-.6L12 2z" fill="currentColor"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  clock: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  users: '<circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="17" cy="8.5" r="2.4" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M15.5 14.3c2.6.4 4.5 2.3 4.5 5.2" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
  pulse: '<path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M4 12l5 5L20 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  call: '<path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1L6.6 10.8z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>',
  info: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 11v5M12 8v.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  warn: '<path d="M12 4l9 16H3L12 4z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M12 10v4M12 17v.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: ICONS[name] || ICONS.info }}
    />
  );
}
