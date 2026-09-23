import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from '../components/Icon.jsx';
import { to12h } from '../utils.js';

function CancelConfirm({ appt, doc, onKeep, onConfirm }) {
  return (
    <>
      <div className="icon-circle">
        <Icon name="x" size={22} />
      </div>
      <h3>Cancel this appointment?</h3>
      <p>
        Your visit with {doc ? doc.name : 'this doctor'} on{' '}
        {new Date(appt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} at {to12h(appt.time)}{' '}
        will be cancelled.
      </p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onKeep}>
          Keep it
        </button>
        <button className="btn" style={{ background: 'var(--danger)', color: '#fff' }} onClick={onConfirm}>
          Cancel visit
        </button>
      </div>
    </>
  );
}

export default function Appointments() {
  const {
    api,
    doctors,
    departments,
    currentPatient,
    ensurePatient,
    showToast,
    openModal,
    closeModal,
    startBooking,
    rescheduleAppointment,
  } = useApp();
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!currentPatient) return;
    try {
      const mine = await api('/appointments');
      mine.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      setList(mine);
      setLoaded(true);
    } catch (err) {
      showToast(err.message, 'warn');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPatient]);

  useEffect(() => {
    load();
  }, [load]);

  async function doCancel(appt) {
    try {
      await api(`/appointments/${appt.id}/cancel`, { method: 'PUT' });
      closeModal();
      showToast('Appointment cancelled.', 'x');
      load();
    } catch (err) {
      showToast(err.message, 'warn');
    }
  }

  function confirmCancel(appt) {
    const doc = doctors.find((d) => d.id === appt.doctorId);
    openModal(<CancelConfirm appt={appt} doc={doc} onKeep={closeModal} onConfirm={() => doCancel(appt)} />, true);
  }

  function handleReschedule(appt) {
    const doc = doctors.find((d) => d.id === appt.doctorId);
    rescheduleAppointment(appt, doc ? doc.dept : null);
  }

  if (!currentPatient) {
    return (
      <div className="view active" id="view-appointments">
        <section style={{ marginTop: 36 }}>
          <div className="eyebrow-row">
            <div>
              <h2 className="section-title">My appointments</h2>
              <p className="section-sub">View, reschedule or cancel your upcoming visits.</p>
            </div>
          </div>
          <div className="empty-state">
            <Icon name="cal" size={44} />
            <h4>Sign in to see your appointments</h4>
            <p>We use your account to keep your bookings together across visits.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => ensurePatient(load)}>
              Sign in
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="view active" id="view-appointments">
      <section style={{ marginTop: 36 }}>
        <div className="eyebrow-row">
          <div>
            <h2 className="section-title">My appointments</h2>
            <p className="section-sub">View, reschedule or cancel your upcoming visits.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={startBooking}>
            + New appointment
          </button>
        </div>

        {loaded && list.length === 0 && (
          <div className="empty-state">
            <Icon name="cal" size={44} />
            <h4>No appointments yet</h4>
            <p>When you book a visit, it will show up here.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={startBooking}>
              Book your first appointment
            </button>
          </div>
        )}

        {list.length > 0 && (
          <div className="appt-list">
            {list.map((a) => {
              const doc = doctors.find((d) => d.id === a.doctorId);
              const dept = doc ? departments.find((d) => d.id === doc.dept) : null;
              const d = new Date(a.date);
              const canAct = a.status === 'upcoming';
              return (
                <div className="appt-card" key={a.id}>
                  <div className="appt-date-box">
                    <b>{d.getDate()}</b>
                    <span>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                  <div className="appt-info">
                    <b>
                      {doc ? doc.name : 'Unknown doctor'} · {to12h(a.time)}
                    </b>
                    <span>
                      {dept ? dept.name : ''} — {a.reason}
                    </span>
                  </div>
                  <span className={`badge ${a.status}`}>{a.status}</span>
                  {canAct && (
                    <div className="appt-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleReschedule(a)}>
                        Reschedule
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => confirmCancel(a)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
