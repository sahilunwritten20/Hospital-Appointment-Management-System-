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
  const counts = week.map((w) => w.count);
  const labels = week.map((w) => w.label);
  const max = Math.max(...counts, 1);
  const w = 320;
  const bw = 28;
  const gap = (w - bw * 7) / 8;
  const chartH = 140;
  const topPad = 20;
  const baseline = 118;
  const maxBarH = chartH - topPad - (chartH - baseline);

  return (
    <svg viewBox={`0 0 ${w} ${chartH}`} xmlns="http://www.w3.org/2000/svg">
      {counts.map((c, i) => {
        const bh = (c / max) * maxBarH;
        const x = gap + i * (bw + gap);
        const y = baseline - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="5" fill={i === 0 ? '#0B2A4A' : '#6FA3D8'} />
            <text
              x={x + bw / 2}
              y={baseline + 15}
              fontSize="10"
              fill="#3E7FC4"
              textAnchor="middle"
              fontFamily="IBM Plex Sans"
            >
              {labels[i]}
            </text>
            <text
              x={x + bw / 2}
              y={Math.max(y - 6, 12)}
              fontSize="11"
              fill="#0B2A4A"
              textAnchor="middle"
              fontFamily="Space Grotesk"
              fontWeight="700"
            >
              {c}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const { api, departments, doctors, currentPatient, showToast, quickBookDept, startBooking } = useApp();
  const [stats, setStats] = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [statsData, todayData] = await Promise.all([api('/stats'), api('/appointments/today')]);
        if (cancelled) return;
        setStats(statsData);
        setTodayAppts(todayData);
        if (currentPatient) {
          const mine = await api('/appointments');
          if (!cancelled) setUpcomingCount(mine.filter((a) => a.status === 'upcoming').length);
        } else if (!cancelled) {
          setUpcomingCount(0);
        }
      } catch (err) {
        if (!cancelled) showToast(err.message, 'warn');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPatient]);

  const totalSlotsPerDoctor = 15; // 09:00-17:00 in 30-min steps minus lunch
  const openToday = stats ? Math.max(stats.doctorsToday * totalSlotsPerDoctor - todayAppts.length, 0) : '–';

  const statCards = stats
    ? [
        { icon: 'cal', val: stats.todayCount, label: "Today's appointments" },
        { icon: 'clock', val: upcomingCount, label: 'Your upcoming visits' },
        { icon: 'users', val: stats.doctorsToday, label: 'Doctors available today' },
        { icon: 'pulse', val: stats.totalDepartments, label: 'Departments covered' },
      ]
    : [];

  const sortedToday = [...todayAppts].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 6);

  return (
    <div className="view active" id="view-dashboard">
      <section>
        <div className="hero">
          <div className="hero-intro">
            <h1>Your care, scheduled without the hold music.</h1>
            <p>
              LifeCare brings every department, doctor and open slot into one place — book, reschedule or
              cancel an appointment in under a minute.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <b>{doctors.length || '–'}</b>
                <span>Doctors on staff</span>
              </div>
              <div className="hero-stat">
                <b>{departments.length || '–'}</b>
                <span>Departments</span>
              </div>
              <div className="hero-stat">
                <b>{openToday}</b>
                <span>Slots open today</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={startBooking}>
              Book an appointment
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
          <div className="panel" style={{ margin: 0 }}>
            <h3>This week&apos;s appointment volume</h3>
            <div className="chart-wrap">{stats && <WeekChart week={stats.week} />}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="stat-row">
          {statCards.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="icon-badge" style={{ color: 'var(--blue)' }}>
                <Icon name={s.icon} size={17} />
              </div>
              <b>{s.val}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="dash-grid">
          <div className="panel">
            <h3>Today&apos;s schedule</h3>
            <div>
              {todayAppts.length === 0 ? (
                <p className="empty-note">No appointments scheduled for today.</p>
              ) : (
                sortedToday.map((a) => {
                  const doc = doctors.find((d) => d.id === a.doctorId);
                  const dept = doc ? departments.find((d) => d.id === doc.dept) : null;
                  return (
                    <div className="today-item" key={a.id}>
                      <div className="today-time">{a.time}</div>
                      <div className="today-info">
                        <b>{a.patientName}</b>
                        <span>
                          {doc ? doc.name : 'Unknown doctor'} · {dept ? dept.name : ''}
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
            <div className="dept-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              {departments.slice(0, 6).map((d) => (
                <button className="dept-card" style={{ cursor: 'pointer' }} key={d.id} onClick={() => quickBookDept(d.id)}>
                  <div className="dept-icon">
                    <Icon name={d.icon} size={19} />
                  </div>
                  <h4>{d.name}</h4>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="eyebrow-row">
          <div>
            <h2 className="section-title">What patients say</h2>
          </div>
        </div>
        <div className="testi-row">
          <div className="testi-card">
            <p>&quot;I rescheduled my cardiology follow-up from my phone during lunch. No calls, no waiting.&quot;</p>
            <div className="testi-name">Aman Mishra</div>
            <div className="testi-role">Patient since 2022</div>
          </div>
          <div className="testi-card">
            <p>&quot;The available time slots update instantly, so I never book something that&apos;s already taken.&quot;</p>
            <div className="testi-name">Sonu Sharma</div>
            <div className="testi-role">Patient since 2021</div>
          </div>
          <div className="testi-card">
            <p>&quot;Clear confirmations and easy cancellations — exactly what a scheduling tool should feel like.&quot;</p>
            <div className="testi-name"> Sachin Yadav</div>
            <div className="testi-role">Patient since 2023</div>
          </div>
        </div>
      </section>

      <section>
        <div className="eyebrow-row">
          <h2 className="section-title">Frequently asked</h2>
        </div>
        <div>
          {FAQS.map((f, i) => (
            <div className={`faq-item${openFaq === i ? ' open' : ''}`} key={f.q}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <Icon name="x" size={16} />
              </button>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="emerg">
          <div>
            <h4>Need urgent care right now?</h4>
            <p>Our emergency department is open 24/7 — no appointment required.</p>
          </div>
          <button className="btn" onClick={() => showToast('Emergency line: +91 9324992701', 'call')}>
            Call Emergency: 9324992701
          </button>
        </div>
      </section>
    </div>
  );
}
