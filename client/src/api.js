
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from '../components/Icon.jsx';

const FAQS = [
  {
    q: 'How do I reschedule an appointment?',
    a: 'Go to My Appointments, find the appointment you want to change, and select Reschedule.',
  },
  {
    q: 'Can I cancel an appointment?',
    a: 'Yes. Open My Appointments and select Cancel next to the appointment you want to cancel.',
  },
  {
    q: 'What if no time slots are available?',
    a: 'Try another date or choose another doctor from the same department.',
  },
  {
    q: 'Is emergency care available?',
    a: 'Yes. The emergency department operates 24/7 and does not require an appointment.',
  },
];

function SafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function Dashboard() {
  const {
    api,
    departments,
    doctors,
    currentPatient,
    showToast,
    quickBookDept,
    startBooking,
  } = useApp();

  const [stats, setStats] = useState({});
  const [todayAppts, setTodayAppts] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Always convert API/context values to arrays.
   * This prevents .map(), .slice(), .find() and .sort()
   * from crashing when the API returns an unexpected value.
   */
  const safeDepartments = SafeArray(departments);
  const safeDoctors = SafeArray(doctors);
  const safeTodayAppts = SafeArray(todayAppts);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);

      try {
        const results = await Promise.allSettled([
          api('/stats'),
          api('/appointments/today'),
        ]);

        if (cancelled) return;

        const statsResult = results[0];
        const appointmentsResult = results[1];

        if (
          statsResult.status === 'fulfilled' &&
          statsResult.value &&
          typeof statsResult.value === 'object' &&
          !Array.isArray(statsResult.value)
        ) {
          setStats(statsResult.value);
        } else {
          setStats({});
        }

        if (appointmentsResult.status === 'fulfilled') {
          setTodayAppts(
            Array.isArray(appointmentsResult.value)
              ? appointmentsResult.value
              : []
          );
        } else {
          setTodayAppts([]);
        }

        /*
         * Load the patient's appointments only when a patient
         * is logged in.
         */
        if (currentPatient) {
          try {
            const appointments = await api('/appointments');

            if (!cancelled) {
              const safeAppointments = Array.isArray(
                appointments
              )
                ? appointments
                : [];

              setUpcomingCount(
                safeAppointments.filter(
                  (appointment) =>
                    appointment &&
                    appointment.status === 'upcoming'
                ).length
              );
            }
          } catch {
            if (!cancelled) {
              setUpcomingCount(0);
            }
          }
        } else if (!cancelled) {
          setUpcomingCount(0);
        }
      } catch (error) {
        if (!cancelled) {
          setStats({});
          setTodayAppts([]);
          setUpcomingCount(0);

          if (typeof showToast === 'function') {
            showToast(
              error?.message ||
                'Unable to load dashboard data.',
              'warn'
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [api, currentPatient, showToast]);

  /*
   * Calculate dashboard values safely.
   */
  const doctorsToday =
    typeof stats?.doctorsToday === 'number'
      ? stats.doctorsToday
      : 0;

  const todayCount =
    typeof stats?.todayCount === 'number'
      ? stats.todayCount
      : safeTodayAppts.length;

  const totalDepartments =
    typeof stats?.totalDepartments === 'number'
      ? stats.totalDepartments
      : safeDepartments.length;

  const openToday = Math.max(
    doctorsToday * 15 - safeTodayAppts.length,
    0
  );

  /*
   * Sort today's appointments safely.
   */
  const sortedToday = useMemo(() => {
    return [...safeTodayAppts]
      .sort((a, b) => {
        const timeA = String(a?.time || '');
        const timeB = String(b?.time || '');

        return timeA.localeCompare(timeB);
      })
      .slice(0, 6);
  }, [todayAppts]);

  /*
   * Department lookup.
   */
  function getDepartmentForDoctor(doctor) {
    if (!doctor) return null;

    return (
      safeDepartments.find(
        (department) =>
          department?.id === doctor?.dept ||
          department?.id === doctor?.departmentId
      ) || null
    );
  }

  /*
   * Find doctor for appointment.
   */
  function getDoctorForAppointment(appointment) {
    if (!appointment) return null;

    return (
      safeDoctors.find(
        (doctor) =>
          doctor?.id === appointment?.doctorId
      ) || null
    );
  }

  /*
   * Dashboard statistic cards.
   */
  const statCards = [
    {
      icon: 'cal',
      value: todayCount,
      label: "Today's appointments",
    },
    {
      icon: 'clock',
      value: upcomingCount,
      label: 'Your upcoming visits',
    },
    {
      icon: 'users',
      value: doctorsToday,
      label: 'Doctors available today',
    },
    {
      icon: 'pulse',
      value: totalDepartments,
      label: 'Departments covered',
    },
  ];

  return (
    <div className="view active" id="view-dashboard">
      {/* HERO */}
      <section>
        <div className="hero">
          <div className="hero-intro">
            <h1>
              Your care, scheduled without the hold music.
            </h1>

            <p>
              LifeCare brings every department, doctor and
              open slot into one place — book, reschedule or
              cancel an appointment in under a minute.
            </p>

            <div className="hero-stats">
              <div className="hero-stat">
                <b>
                  {safeDoctors.length}
                </b>
                <span>Doctors on staff</span>
              </div>

              <div className="hero-stat">
                <b>
                  {safeDepartments.length}
                </b>
                <span>Departments</span>
              </div>

              <div className="hero-stat">
                <b>
                  {loading ? '–' : openToday}
                </b>
                <span>Slots open today</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: 24 }}
              onClick={startBooking}
            >
              Book an appointment

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* WEEKLY APPOINTMENT PANEL */}
          <div
            className="panel"
            style={{ margin: 0 }}
          >
            <h3>
              This week's appointment volume
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingTop: '18px',
              }}
            >
              {Array.isArray(stats?.week) &&
              stats.week.length > 0 ? (
                stats.week.map((item, index) => {
                  const count =
                    typeof item?.count === 'number'
                      ? item.count
                      : 0;

                  return (
                    <div
                      key={index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '45px 1fr 35px',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span>
                        {item?.label || ''}
                      </span>

                      <div
                        style={{
                          height: '18px',
                          background:
                            '#e8eef5',
                          borderRadius: '5px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(
                              count * 10,
                              100
                            )}%`,
                            height: '100%',
                            background:
                              '#6FA3D8',
                            borderRadius: '5px',
                          }}
                        />
                      </div>

                      <strong>
                        {count}
                      </strong>
                    </div>
                  );
                })
              ) : (
                <p className="empty-note">
                  No weekly appointment data available.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section>
        <div className="stat-row">
          {statCards.map((stat) => (
            <div
              className="stat-card"
              key={stat.label}
            >
              <div
                className="icon-badge"
                style={{ color: 'var(--blue)' }}
              >
                <Icon
                  name={stat.icon}
                  size={17}
                />
              </div>

              <b>
                {loading ? '–' : stat.value}
              </b>

              <span>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* TODAY + DEPARTMENTS */}
      <section>
        <div className="dash-grid">
          {/* TODAY'S SCHEDULE */}
          <div className="panel">
            <h3>
              Today's schedule
            </h3>

            {sortedToday.length === 0 ? (
              <p className="empty-note">
                No appointments scheduled for today.
              </p>
            ) : (
              <div>
                {sortedToday.map((appointment) => {
                  const doctor =
                    getDoctorForAppointment(
                      appointment
                    );

                  const department =
                    getDepartmentForDoctor(
                      doctor
                    );

                  return (
                    <div
                      className="today-item"
                      key={
                        appointment?.id ||
                        `${appointment?.time}-${appointment?.doctorId}`
                      }
                    >
                      <div className="today-time">
                        {appointment?.time || '—'}
                      </div>

                      <div className="today-info">
                        <b>
                          {appointment?.patientName ||
                            appointment?.patient?.name ||
                            'Patient'}
                        </b>

                        <span>
                          {doctor?.name ||
                            'Doctor'}

                          {department?.name
                            ? ` · ${department.name}`
                            : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DEPARTMENTS */}
          <div className="panel">
            <h3>
              Departments
            </h3>

            {safeDepartments.length === 0 ? (
              <p className="empty-note">
                No departments available.
              </p>
            ) : (
              <div
                className="dept-grid"
                style={{
                  gridTemplateColumns:
                    'repeat(2, 1fr)',
                }}
              >
                {safeDepartments
                  .slice(0, 6)
                  .map((department) => (
                    <button
                      className="dept-card"
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        textAlign: 'left',
                      }}
                      key={
                        department?.id ||
                        department?.name
                      }
                      onClick={() => {
                        if (
                          typeof quickBookDept ===
                          'function'
                        ) {
                          quickBookDept(
                            department?.id
                          );
                        }
                      }}
                    >
                      <div className="dept-icon">
                        <Icon
                          name={
                            department?.icon ||
                            'pulse'
                          }
                          size={19}
                        />
                      </div>

                      <h4>
                        {department?.name ||
                          'Department'}
                      </h4>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div className="eyebrow-row">
          <div>
            <h2 className="section-title">
              What patients say
            </h2>
          </div>
        </div>

        <div className="testi-row">
          <div className="testi-card">
            <p>
              "I rescheduled my cardiology follow-up
              from my phone during lunch. No calls,
              no waiting."
            </p>

            <div className="testi-name">
              Aman Mishra
            </div>

            <div className="testi-role">
              Patient since 2022
            </div>
          </div>

          <div className="testi-card">
            <p>
              "The available time slots update
              instantly, so I never book something
              that's already taken."
            </p>

            <div className="testi-name">
              Sonu Sharma
            </div>

            <div className="testi-role">
              Patient since 2021
            </div>
          </div>

          <div className="testi-card">
            <p>
              "Clear confirmations and easy
              cancellations — exactly what a
              scheduling tool should feel like."
            </p>

            <div className="testi-name">
              Sachin Yadav
            </div>

            <div className="testi-role">
              Patient since 2023
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="eyebrow-row">
          <h2 className="section-title">
            Frequently asked
          </h2>
        </div>

        <div>
          {FAQS.map((faq, index) => {
            const isOpen =
              openFaq === index;

            return (
              <div
                className={`faq-item${
                  isOpen ? ' open' : ''
                }`}
                key={faq.q}
              >
                <button
                  className="faq-q"
                  onClick={() =>
                    setOpenFaq(
                      isOpen ? null : index
                    )
                  }
                >
                  {faq.q}

                  <Icon
                    name="x"
                    size={16}
                  />
                </button>

                <div className="faq-a">
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EMERGENCY */}
      <section>
        <div className="emerg">
          <div>
            <h4>
              Need urgent care right now?
            </h4>

            <p>
              Our emergency department is open
              24/7 — no appointment required.
            </p>
          </div>

          <button
            className="btn"
            onClick={() => {
              if (
                typeof showToast ===
                'function'
              ) {
                showToast(
                  'Emergency line: +91 9324992701',
                  'call'
                );
              }
            }}
          >
            Call Emergency: 9324992701
          </button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
