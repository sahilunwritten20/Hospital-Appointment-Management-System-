import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { initials } from '../utils.js';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'book', label: 'Book Appointment' },
  { key: 'doctors', label: 'Doctors' },
  { key: 'appointments', label: 'My Appointments' },
];

export default function Header() {
  const { view, switchView, currentPatient, signOut, ensurePatient } = useApp();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" width="19" height="19">
            <path
              d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5l7-3z"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M5 12h3l1.5-4.5L12 15l1.5-6L15 12h4"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="brand-name">LifeCare </div>
          <div className="brand-tag">Hospital &amp; Care Network</div>
        </div>
      </div>

      <nav className={`mainnav${navOpen ? ' open' : ''}`} id="mainnav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={view === item.key ? 'active' : ''}
            onClick={() => {
              switchView(item.key);
              setNavOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="header-right">
        <div id="account-slot">
          {currentPatient ? (
            <div className="account-pill">
              <div className="avatar-sm">{initials(currentPatient.name)}</div>
              <span className="acct-name">{currentPatient.name.split(' ')[0]}</span>
              <button onClick={() => signOut()}>Sign out</button>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => ensurePatient(() => {})}>
              Sign in
            </button>
          )}
        </div>
        <button className="hamburger" aria-label="Toggle menu" onClick={() => setNavOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#0B2A4A" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
