import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from './Icon.jsx';

export default function AuthModal({ onSuccess }) {
  const { api, showToast, closeModal } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === 'signup';

  async function submit() {
    if (!email || !password) {
      showToast('Email and password are required.', 'warn');
      return;
    }
    setSubmitting(true);
    try {
      let result;
      if (isSignup) {
        if (!name.trim()) {
          showToast('Full name is required.', 'warn');
          setSubmitting(false);
          return;
        }
        result = await api('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), email, password, phone: phone.trim() }),
        });
      } else {
        result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      }
      onSuccess(result.token, result.patient);
    } catch (err) {
      showToast(err.message, 'warn');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="icon-circle">
        <Icon name="users" size={22} />
      </div>
      <h3>{isSignup ? 'Create your account' : 'Log in'}</h3>
      <p>{isSignup ? 'A few details to set up your patient account.' : 'Log in to book, reschedule or cancel appointments.'}</p>
      <div className="form-grid">
        {isSignup && (
          <div className="full">
            <label htmlFor="au-name">Full name</label>
            <input id="au-name" placeholder="e.g. Rahul Verma" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="full">
          <label htmlFor="au-email">Email</label>
          <input id="au-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {isSignup && (
          <div className="full">
            <label htmlFor="au-phone">Phone (optional)</label>
            <input id="au-phone" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        )}
        <div className="full">
          <label htmlFor="au-password">Password</label>
          <input
            id="au-password"
            type="password"
            placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={closeModal}>
          Cancel
        </button>
        <button className="btn btn-primary" disabled={submitting} onClick={submit}>
          {isSignup ? 'Sign up' : 'Log in'}
        </button>
      </div>
      <p style={{ marginTop: 14, fontSize: 12.5 }}>
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <a
          href="#"
          style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'underline' }}
          onClick={(e) => {
            e.preventDefault();
            setMode(isSignup ? 'login' : 'signup');
          }}
        >
          {isSignup ? 'Log in' : 'Sign up'}
        </a>
      </p>
    </>
  );
}
