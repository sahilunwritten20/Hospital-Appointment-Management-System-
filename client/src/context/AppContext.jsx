import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api.js';
import AuthModal from '../components/AuthModal.jsx';

const AppContext = createContext(null);

function initialWizard() {
  return { step: 0, deptId: null, doctorId: null, date: null, time: null, rescheduleId: null };
}

export function AppProvider({ children }) {
  const [view, setView] = useState('dashboard');
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('bw_token') || null);
  const [currentPatient, setCurrentPatient] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bw_patient') || 'null');
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null); // { msg, icon, key }
  const [modal, setModal] = useState(null); // { content, danger }
  const [deptFilter, setDeptFilter] = useState('all');
  const [wizard, setWizard] = useState(initialWizard());

  /* ------------------------------- toast/modal ------------------------------ */
  const showToast = useCallback((msg, iconName = 'info') => {
    setToast({ msg, icon: iconName, key: Date.now() });
  }, []);
  const openModal = useCallback((content, danger = false) => setModal({ content, danger }), []);
  const closeModal = useCallback(() => setModal(null), []);

  /* --------------------------------- session --------------------------------- */
  const clearSession = useCallback(() => {
    setAuthToken(null);
    setCurrentPatient(null);
    localStorage.removeItem('bw_token');
    localStorage.removeItem('bw_patient');
  }, []);

  const setSession = useCallback((token, patient) => {
    setAuthToken(token);
    setCurrentPatient(patient);
    localStorage.setItem('bw_token', token);
    localStorage.setItem('bw_patient', JSON.stringify(patient));
  }, []);

  // Generic API call bound to the current auth token. Auto-clears the
  // session on a 401 so the UI reflects "signed out".
  const api = useCallback(
    async (path, options = {}) => {
      try {
        return await apiRequest(path, options, authToken);
      } catch (err) {
        if (err.status === 401) clearSession();
        throw err;
      }
    },
    [authToken, clearSession]
  );

  const signOut = useCallback(
    async (callApi = true) => {
      if (callApi && authToken) {
        try {
          await apiRequest('/auth/logout', { method: 'POST' }, authToken);
        } catch {
          /* token may already be invalid — fine */
        }
      }
      clearSession();
      showToast('Signed out.', 'info');
    },
    [authToken, clearSession, showToast]
  );

  // Opens a sign up / log in modal (or resolves instantly if already
  // signed in), then runs `then` once authenticated.
  const ensurePatient = useCallback(
    (then) => {
      if (currentPatient) {
        then();
        return;
      }
      openModal(
        <AuthModal
          onSuccess={(token, patient) => {
            setSession(token, patient);
            closeModal();
            then();
          }}
        />
      );
    },
    [currentPatient, openModal, closeModal, setSession]
  );

  // On page load, if we have a stored token, confirm it's still valid and
  // refresh the patient's details (handles an expired/invalid token cleanly).
  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      if (!authToken) return;
      try {
        const { patient } = await apiRequest('/auth/me', {}, authToken);
        if (!cancelled) {
          setCurrentPatient(patient);
          localStorage.setItem('bw_patient', JSON.stringify(patient));
        }
      } catch {
        if (!cancelled) clearSession();
      }
    }
    restoreSession();
    return () => {
      cancelled = true;
    };
    // Only ever run this once on mount, using whatever token was in
    // localStorage at load time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load reference data (departments & doctors) once on mount.
  useEffect(() => {
    let cancelled = false;
    async function loadReferenceData() {
      try {
        const [depts, docs] = await Promise.all([apiRequest('/departments'), apiRequest('/doctors')]);
        if (!cancelled) {
          setDepartments(depts);
          setDoctors(docs);
          setDataReady(true);
        }
      } catch (err) {
        if (!cancelled) showToast(err.message, 'warn');
      }
    }
    loadReferenceData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------- nav ---------------------------------- */
  const switchView = useCallback((name) => {
    setView(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* -------------------------------- booking -------------------------------- */
  const startBooking = useCallback(() => {
    setWizard(initialWizard());
    switchView('book');
  }, [switchView]);

  const quickBookDept = useCallback(
    (deptId) => {
      setWizard({ step: 1, deptId, doctorId: null, date: null, time: null, rescheduleId: null });
      switchView('book');
    },
    [switchView]
  );

  const quickBookDoctor = useCallback(
    (doctorId, deptId) => {
      setWizard({ step: 2, deptId, doctorId, date: null, time: null, rescheduleId: null });
      switchView('book');
    },
    [switchView]
  );

  // Accepts the full appointment object (the caller already has it loaded)
  // rather than re-fetching by id.
  const rescheduleAppointment = useCallback(
    (appt, deptId) => {
      setWizard({ step: 2, deptId, doctorId: appt.doctorId, date: null, time: null, rescheduleId: appt.id });
      switchView('book');
    },
    [switchView]
  );

  const value = useMemo(
    () => ({
      view,
      switchView,
      departments,
      doctors,
      dataReady,
      authToken,
      currentPatient,
      api,
      setSession,
      signOut,
      ensurePatient,
      showToast,
      openModal,
      closeModal,
      modal,
      toast,
      deptFilter,
      setDeptFilter,
      wizard,
      setWizard,
      startBooking,
      quickBookDept,
      quickBookDoctor,
      rescheduleAppointment,
    }),
    [
      view,
      switchView,
      departments,
      doctors,
      dataReady,
      authToken,
      currentPatient,
      api,
      setSession,
      signOut,
      ensurePatient,
      showToast,
      openModal,
      closeModal,
      modal,
      toast,
      deptFilter,
      wizard,
      startBooking,
      quickBookDept,
      quickBookDoctor,
      rescheduleAppointment,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
