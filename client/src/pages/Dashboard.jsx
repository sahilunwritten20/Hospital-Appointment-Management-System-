```jsx
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from '../components/Icon.jsx';

const FAQS = [
  {
    q: 'How do I reschedule an appointment?',
    a: 'Go to “My Appointments”, find the visit you want to change, and select Reschedule. You’ll pick a new date and time without losing your original doctor.',
  },
  {
    q: 'Can I cancel without calling the hospital?',
    a: 'Yes. Open “My Appointments” and select Cancel next to the relevant booking. A confirmation will appear before it’s finalized.',
  },
  {
    q: 'What if no time slots are shown for a doctor?',
    a: 'That means the doctor is fully booked on that date, or does not consult that day. Try another date or a different doctor in the same department.',
  },
  {
    q: 'Is walk-in emergency care available?',
    a: 'Yes, our emergency department operates 24/7 and does not require a scheduled appointment.',
  },
];

function WeekChart({ week }) {
  const safeWeek = Array.isArray(week) ? week : [];

  const counts = safeWeek.map((item) =>
    typeof item?.count === 'number' ? item.count : 0
  );

  const labels = safeWeek.map((item) => item?.label || '');

  const max = Math.max(...counts, 1);

  const width = 320;
  const barWidth = 28;
  const gap = (width - barWidth * 7) / 8;
  const chartHeight = 140;
  const topPadding = 20;
  const baseline = 118;
  const maxBarHeight =
    chartHeight - topPadding - (chartHeight - baseline);

  return (
    <svg
      viewBox={`0 0 ${width} ${chartHeight}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {counts.map((count, index) => {
        const barHeight = (count / max) * maxBarHeight;
        const x = gap + index * (barWidth + gap);
        const y = baseline - barHeight;

        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="5"
              fill={index === 0 ? '#0B2A4A' : '#6FA3D8'}
            />

            <text
              x={x + barWidth / 2}
              y={baseline + 15}
              fontSize="10"
              fill="#3E7FC4"
              textAnchor="middle"
              fontFamily="IBM Plex Sans"
            >
              {labels[index]}
            </text>

            <text
              x={x + barWidth / 2}
              y={Math.max(y - 6, 12)}
              fontSize="11"
              fill="#0B2A4A"
              textAnchor="middle"
              fontFamily="Space Grotesk"
              fontWeight="700"
            >
              {count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const {
    api,
    departments,
    doctors,
    currentPatient,
    showToast,
    quickBookDept,
    startBooking,
  } = useApp();

  const [stats, setStats] = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // Always make sure these values are arrays.
  const safeDepartments = Array.isArray(departments)
    ? departments
    : [];

  const safeDoctors = Array.isArray(doctors)
    ? doctors
    : [];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statsData, todayData] = await Promise.all([
          api('/stats'),
          api('/appointments/today'),
        ]);

        if (cancelled) return;

        setStats(statsData || {});

        setTodayAppts(
          Array.isArray(todayData)
            ? todayData
            : []
        );

        if (currentPatient) {
          const mine = await api('/appointments');

          if (!cancelled) {
            const safeMine = Array.isArray(mine)
              ? mine
              : [];

            setUpcomingCount(
              safeMine.filter(
                (appointment) =>
                  appointment?.status === 'upcoming'
              ).length
            );
          }
        } else if (!cancelled) {
          setUpcomingCount(0);
        }
      } catch (err) {
        if (!cancelled) {
          showToast(
            err?.message || 'Unable to load dashboard data.',
            'warn'
          );
        }

        if (!cancelled) {
          setTodayAppts([]);
          setUpcomingCount(0);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPatient]);

  const safeTodayAppts = Array.isArray(todayAppts)
    ? todayAppts
    : [];

  const totalSlotsPerDoctor = 15;

  const doctorsToday =
    typeof stats?.doctorsToday === 'number'
      ? stats.doctorsToday
      : 0;

  const openToday = stats
    ? Math.max(
        doctorsToday * totalSlotsPerDoctor -
          safeTodayAppts.length,
        0
      )
    : '–';

  const statCards = stats
    ? [
        {
          icon: 'cal',
          val: stats.todayCount ?? 0,
          label: "Today's appointments",
        },
        {
          icon: 'clock',
          val: upcomingCount,
          label: 'Your upcoming visits',
        },
        {
          icon: 'users',
          val: doctorsToday,
          label: 'Doctors available today',
        },
        {
          icon: 'pulse',
          val: stats.totalDepartments ?? 0,
          label: 'Departments covered',
        },
      ]
    : [];

  const sortedToday = [...safeTodayAppts]
    .sort((a, b) =>
      String(a?.time || '').localeCompare(
        String(b?.time || '')
      )
    )
    .slice(0, 6);

  return (
    <div className="view active" id="view-dashboard">
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
                  {safeDoctors.length || '–'}
                </b>
                <span>Doctors on staff</span>
              </div>

              <div className="hero-stat">
                <b>
                  {safeDepartments.length || '–'}
                </b>
                <span>Departments</span>
              </div>

              <div className="hero-stat">
                <b>{openToday}</b>
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
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div
            className="panel"
            style={{ margin: 0 }}
          >
            <h3>
              This week's appointment volume
            </h3>

            <div className="chart-wrap">
              {stats && (
                <WeekChart week={stats.week} />
              )}
            </div>
          </div>
        </div>
      </section>

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

              <b>{stat.val}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="dash-grid">
          <div className="panel">
            <h3>Today's schedule</h3>

            <div>
              {safeTodayAppts.length === 0 ? (
                <p className="empty-note">
                  No appointments scheduled for today.
                </p>
              ) : (
                sortedToday.map((appointment) => {
                  const doctor = safeDoctors.find(
                    (doctorItem) =>
                      doctorItem?.id ===
                      appointment?.doctorId
                  );

                  const department = doctor
                    ? safeDepartments.find(
                        (departmentItem) =>
                          departmentItem?.id ===
                          doctor?.dept
                      )
                    : null;

                  return (
                    <div
                      className="today-item"
                      key={appointment?.id}
                    >
                      <div className="today-time">
                        {appointment?.time || '—'}
                      </div>

                      <div className="today-info">
                        <b>
                          {appointment?.patientName ||
                            'Unknown patient'}
                        </b>

                        <span>
                          {doctor?.name ||
                            'Unknown doctor'}

                          {' · '}

                          {department?.name || ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="panel">
            <h3>Departments</h3>

            <div
              className="dept-grid"
              style={{
                gridTemplateColumns:
                  'repeat(2,1fr)',
              }}
            >
              {safeDepartments
                .slice(0, 6)
                .map((department) => (
                  <button
                    className="dept-card"
                    style={{ cursor: 'pointer' }}
                    key={department?.id}
                    onClick={() =>
                      quickBookDept(
                        department?.id
                      )
                    }
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

            {safeDepartments.length === 0 && (
              <p className="empty-note">
                No departments available.
              </p>
            )}
          </div>
        </div>
      </section>

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

      <section>
        <div className="eyebrow-row">
          <h2 className="section-title">
            Frequently asked
          </h2>
        </div>

        <div>
          {FAQS.map((faq, index) => (
            <div
              className={`faq-item${
                openFaq === index
                  ? ' open'
                  : ''
              }`}
              key={faq.q}
            >
              <button
                className="faq-q"
                onClick={() =>
                  setOpenFaq(
                    openFaq === index
                      ? null
                      : index
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
          ))}
        </div>
      </section>

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
            onClick={() =>
              showToast(
                'Emergency line: +91 9324992701',
                'call'
              )
            }
          >
            Call Emergency: 9324992701
          </button>
        </div>
      </section>
    </div>
  );
}
```