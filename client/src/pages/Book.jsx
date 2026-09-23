import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from '../components/Icon.jsx';
import { avatarColors, initials, fmtISO, to12h, WEEKDAY_NAMES } from '../utils.js';

const STEP_LABELS = ['Department', 'Doctor', 'Date', 'Time', 'Your details'];

function Stepper({ step }) {
  return (
    <div className="stepper">
      {STEP_LABELS.map((s, i) => {
        const cls = i < step ? 'done' : i === step ? 'current' : '';
        return (
          <React.Fragment key={s}>
            <div className={`step-dot ${cls}`}>
              <div className="step-num">{i < step ? <Icon name="check" size={12} /> : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
            {i < STEP_LABELS.length - 1 && <div className="step-line"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Book() {
  const { api, departments, doctors, currentPatient, wizard, setWizard, ensurePatient, showToast, switchView } =
    useApp();
  const [availability, setAvailability] = useState(null); // { works, slots } for step 3
  const [name, setName] = useState(currentPatient ? currentPatient.name : '');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const doc = doctors.find((d) => d.id === wizard.doctorId);
  const dept = doc ? departments.find((d) => d.id === doc.dept) : null;

  useEffect(() => {
    if (currentPatient) setName(currentPatient.name);
  }, [currentPatient]);

  // Fetch availability whenever we're on the time-picking step for a
  // given doctor/date.
  useEffect(() => {
    let cancelled = false;
    async function loadAvailability() {
      if (wizard.step !== 3 || !wizard.doctorId || !wizard.date) return;
      setAvailability(null); // clear any stale slots from a previous doctor/date before fetching
      try {
        const avail = await api(`/doctors/${wizard.doctorId}/availability?date=${wizard.date}`);
        if (!cancelled) setAvailability(avail);
      } catch (err) {
        if (!cancelled) showToast(err.message, 'warn');
      }
    }
    loadAvailability();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.step, wizard.doctorId, wizard.date]);

  function pickDept(id) {
    setWizard({ ...wizard, deptId: id, doctorId: null });
  }
  function pickDoctor(id) {
    setWizard({ ...wizard, doctorId: id });
  }
  function pickDate(iso) {
    setWizard({ ...wizard, date: iso, time: null });
  }
  function pickTime(t) {
    setWizard({ ...wizard, time: t });
  }
  function goBack() {
    if (wizard.step > 0) setWizard({ ...wizard, step: wizard.step - 1 });
  }

  async function finalizeBooking() {
    const finalName = name.trim() || currentPatient.name;
    const finalReason = reason.trim() || 'General consultation';
    setSubmitting(true);
    try {
      if (wizard.rescheduleId) {
        await api(`/appointments/${wizard.rescheduleId}`, {
          method: 'PUT',
          body: JSON.stringify({ date: wizard.date, time: wizard.time }),
        });
        showToast('Appointment rescheduled successfully.', 'check');
      } else {
        await api('/appointments', {
          method: 'POST',
          body: JSON.stringify({
            patientName: finalName,
            doctorId: wizard.doctorId,
            date: wizard.date,
            time: wizard.time,
            reason: finalReason,
          }),
        });
        showToast('Appointment booked successfully.', 'check');
      }
      switchView('appointments');
    } catch (err) {
      showToast(err.message, 'warn');
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (wizard.step < 4) {
      setWizard({ ...wizard, step: wizard.step + 1 });
    } else {
      ensurePatient(finalizeBooking);
    }
  }

  const nextDisabled =
    (wizard.step === 0 && !wizard.deptId) ||
    (wizard.step === 1 && !wizard.doctorId) ||
    (wizard.step === 2 && !wizard.date) ||
    (wizard.step === 3 && !wizard.time) ||
    submitting;

  return (
    <div className="view active" id="view-book">
      <section style={{ marginTop: 36 }}>
        <div className="eyebrow-row">
          <div>
            <h2 className="section-title">Book an appointment</h2>
            <p className="section-sub">Pick a department, choose your doctor, then find a time that works for you.</p>
          </div>
        </div>

        <div className="wizard">
          <Stepper step={wizard.step} />

          <div className="wizard-body">
            {wizard.step === 0 && (
              <div className="chip-grid">
                {departments.map((d) => (
                  <button
                    key={d.id}
                    className={`chip dept-chip${wizard.deptId === d.id ? ' selected' : ''}`}
                    onClick={() => pickDept(d.id)}
                  >
                    <Icon name={d.icon} size={16} />
                    {d.name}
                  </button>
                ))}
              </div>
            )}

            {wizard.step === 1 && (
              <div className="doc-pick-grid">
                {doctors
                  .filter((d) => d.dept === wizard.deptId)
                  .map((d) => {
                    const color = avatarColors[d.id % avatarColors.length];
                    return (
                      <button
                        key={d.id}
                        className={`doc-pick${wizard.doctorId === d.id ? ' selected' : ''}`}
                        onClick={() => pickDoctor(d.id)}
                      >
                        <div className="avatar" style={{ background: color }}>
                          {initials(d.name)}
                        </div>
                        <div>
                          <div className="doc-pick-name">{d.name}</div>
                          <div className="doc-pick-meta">
                            {d.role} · {d.rating}★
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {wizard.step === 2 && doc && (
              <>
                <div className="date-scroll">
                  {Array.from({ length: 14 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const works = doc.days.includes(d.getDay());
                    const iso = fmtISO(d);
                    return (
                      <button
                        key={iso}
                        className={`date-chip${wizard.date === iso ? ' selected' : ''}${works ? '' : ' off'}`}
                        disabled={!works}
                        onClick={() => works && pickDate(iso)}
                      >
                        <div className="dow">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="dnum">{d.getDate()}</div>
                        <div className="dmon">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="empty-note">
                  {doc.name} consults on {doc.days.map((x) => WEEKDAY_NAMES[x]).join(', ')}.
                </p>
              </>
            )}

            {wizard.step === 3 && doc && availability && (
              <>
                {availability.slots.every((s) => !s.available) ? (
                  <div className="empty-state">
                    <Icon name="clock" size={40} />
                    <h4>Fully booked on this date</h4>
                    <p>Go back and choose a different date for {doc.name}.</p>
                  </div>
                ) : (
                  <div className="time-grid">
                    {availability.slots.map((s) => (
                      <button
                        key={s.time}
                        className={`chip time-chip${wizard.time === s.time ? ' selected' : ''}${s.available ? '' : ' full'}`}
                        disabled={!s.available}
                        onClick={() => s.available && pickTime(s.time)}
                      >
                        {to12h(s.time)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {wizard.step === 4 && doc && (
              <div className="form-grid">
                <div>
                  <label htmlFor="f-name">Full name</label>
                  <input
                    id="f-name"
                    placeholder="e.g. Rahul Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="f-phone">Phone number</label>
                  <input id="f-phone" placeholder="+91 98765 43210" defaultValue={currentPatient ? currentPatient.phone : ''} />
                </div>
                <div>
                  <label htmlFor="f-email">Email</label>
                  <input id="f-email" placeholder="you@example.com" defaultValue={currentPatient ? currentPatient.email : ''} />
                </div>
                <div>
                  <label htmlFor="f-age">Age</label>
                  <input id="f-age" type="number" min="0" placeholder="e.g. 32" />
                </div>
                <div className="full">
                  <label htmlFor="f-reason">Reason for visit</label>
                  <textarea
                    id="f-reason"
                    placeholder="Briefly describe your symptoms or reason for the appointment"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div className="full">
                  <div className="summary-card">
                    <div>
                      <span>Department</span>
                      <b>{dept ? dept.name : ''}</b>
                    </div>
                    <div>
                      <span>Doctor</span>
                      <b>{doc.name}</b>
                    </div>
                    <div>
                      <span>Date</span>
                      <b>
                        {wizard.date &&
                          new Date(wizard.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                      </b>
                    </div>
                    <div>
                      <span>Time</span>
                      <b>{wizard.time && to12h(wizard.time)}</b>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="wizard-actions">
            <button className="btn btn-ghost" style={{ visibility: wizard.step === 0 ? 'hidden' : 'visible' }} onClick={goBack}>
              Back
            </button>
            <button className="btn btn-primary" disabled={nextDisabled} onClick={goNext}>
              {wizard.step === 4 ? (wizard.rescheduleId ? 'Confirm reschedule' : 'Confirm booking') : 'Continue'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
