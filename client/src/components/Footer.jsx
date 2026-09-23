import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const QUICK_LINKS = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'book', label: 'Book an appointment' },
  { view: 'doctors', label: 'Find a doctor' },
  { view: 'appointments', label: 'My appointments' },
];

const DEPT_LINKS = [
  ['cardiology', 'Cardiology'],
  ['neurology', 'Neurology'],
  ['ortho', 'Orthopedics'],
  ['pediatrics', 'Pediatrics'],
  ['derma', 'Dermatology'],
  ['ent', 'ENT'],
  ['dental', 'Dental'],
  ['general', 'General Medicine'],
];

export default function Footer() {
  const { switchView, setDeptFilter, showToast } = useApp();
  const [email, setEmail] = useState('');

  function goView(e, view) {
    e.preventDefault();
    switchView(view);
  }
  function goDept(e, dept) {
    e.preventDefault();
    setDeptFilter(dept);
    switchView('doctors');
  }
  function notReady(e, label) {
    e.preventDefault();
    showToast(`${label} isn't set up yet.`, 'info');
  }
  function subscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    showToast(`Subscribed ${email.trim()} to health tips.`, 'check');
    setEmail('');
  }

  return (
    <footer className="site-footer">
      <div className="footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path
            d="M0 30 C 240 60 480 0 720 20 C 960 40 1200 0 1440 25 L1440 60 L0 60 Z"
            fill="var(--sky-2)"
          />
        </svg>
      </div>

      <div className="footer-main">
        <div className="footer-top">
          <div className="footer-col footer-brand-col">
            <div className="footer-brand">
              <div className="footer-mark">
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
                <div className="footer-brand-name">LifeCare</div>
                <div className="footer-brand-tag">Hospital &amp; Care Network</div>
              </div>
            </div>
            <p className="footer-desc">
              Multi-specialty care across 8 departments, with same-day appointment booking and 24/7
              emergency support — trusted by over 40,000 patients since 2010.
            </p>

            <div className="footer-badges">
              <span className="trust-badge">NABH Accredited</span>
              <span className="trust-badge">ISO 9001:2015</span>
              <span className="trust-badge">24/7 Emergency</span>
            </div>

            <div className="footer-social">
              <a href="#" aria-label="Facebook" className="social-btn" onClick={(e) => notReady(e, 'Facebook')}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <path
                    d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="social-btn" onClick={(e) => notReady(e, 'Instagram')}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="16.2" cy="7.8" r="0.9" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="X / Twitter" className="social-btn" onClick={(e) => notReady(e, 'X / Twitter')}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="social-btn" onClick={(e) => notReady(e, 'LinkedIn')}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <rect x="4" y="9" width="3" height="9" fill="currentColor" />
                  <circle cx="5.5" cy="5.5" r="1.6" fill="currentColor" />
                  <path
                    d="M11 9h3v1.6c.6-1 1.7-1.8 3.2-1.8 2.4 0 3.8 1.6 3.8 4.4V18h-3v-4.3c0-1.3-.5-2.2-1.7-2.2-1 0-1.6.7-1.9 1.3-.1.3-.1.6-.1 1V18h-3V9z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="social-btn" onClick={(e) => notReady(e, 'YouTube')}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M10.5 9.5l4.5 2.5-4.5 2.5v-5z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick links</h4>
            <ul className="footer-links">
              {QUICK_LINKS.map((l) => (
                <li key={l.view}>
                  <a href="#" onClick={(e) => goView(e, l.view)}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Departments</h4>
            <ul className="footer-links footer-links-grid">
              {DEPT_LINKS.map(([id, label]) => (
                <li key={id}>
                  <a href="#" onClick={(e) => goDept(e, id)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col footer-newsletter-col">
            <h4 className="footer-heading">Contact us</h4>
            <ul className="footer-contact">
              <li>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <path
                    d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <span> SV Road ,Malad West </span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <path
                    d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1L6.6 10.8z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>+91 9324992701</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <span>LifeCare@gmail.com</span>
              </li>
            </ul>

            <h4 className="footer-heading footer-newsletter-heading">Get health tips &amp; updates</h4>
            <form className="newsletter-form" onSubmit={subscribe}>
              <input
                type="email"
                placeholder="you@example.com"
                required
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" aria-label="Subscribe">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-emergency-strip">
        <span className="pulse-dot" aria-hidden="true"></span>
        <span>Medical emergency?</span>
        <a href="tel:+9118002339090">Call 9324992701 — available 24/7</a>
      </div>

      <div className="footer-bottom">
        <span>© 2026 LifeCare Hospital &amp; Care Network. All rights reserved.</span>
        <div className="footer-legal">
          <a href="#" onClick={(e) => notReady(e, 'Privacy Policy')}>
            Privacy Policy
          </a>
          <a href="#" onClick={(e) => notReady(e, 'Terms of Use')}>
            Terms of Use
          </a>
          <a href="#" onClick={(e) => notReady(e, 'Accessibility')}>
            Accessibility
          </a>
        </div>
        <button
          className="back-to-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
            <path
              d="M12 19V5M5 12l7-7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
}
