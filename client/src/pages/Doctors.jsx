import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Icon from '../components/Icon.jsx';
import { avatarColors, initials, fmtISO } from '../utils.js';

export default function Doctors() {
  const { api, departments, deptFilter, setDeptFilter, showToast, quickBookDoctor } = useApp();
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [openToday, setOpenToday] = useState({}); // doctorId -> open slot count
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const qs = new URLSearchParams();
        if (deptFilter !== 'all') qs.set('dept', deptFilter);
        if (search) qs.set('search', search);

        const results = await api(`/doctors?${qs.toString()}`);
        if (cancelled) return;
        setList(results);
        setLoaded(true);

        const today = fmtISO(new Date());
        const availPairs = await Promise.all(
          results.map(async (d) => {
            const avail = await api(`/doctors/${d.id}/availability?date=${today}`);
            return [d.id, avail.slots.filter((s) => s.available).length];
          })
        );
        if (!cancelled) setOpenToday(Object.fromEntries(availPairs));
      } catch (err) {
        if (!cancelled) showToast(err.message, 'warn');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptFilter, search]);

  return (
    <div className="view active" id="view-doctors">
      <section style={{ marginTop: 36 }}>
        <div className="eyebrow-row">
          <div>
            <h2 className="section-title">Our doctors</h2>
            <p className="section-sub">Search by name or specialty, or filter by department to find the right fit.</p>
          </div>
        </div>

        <div className="doctor-toolbar">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search doctors or specialties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="doctor-toolbar">
          {['all', ...departments.map((d) => d.id)].map((id) => {
            const label = id === 'all' ? 'All departments' : departments.find((d) => d.id === id)?.name;
            return (
              <button
                key={id}
                className={`filter-chip${deptFilter === id ? ' selected' : ''}`}
                onClick={() => setDeptFilter(id)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="doctor-grid">
          {loaded && list.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <Icon name="users" size={44} />
              <h4>No doctors match your search</h4>
              <p>Try a different name, specialty or department.</p>
            </div>
          )}
          {list.map((d) => {
            const dept = departments.find((x) => x.id === d.dept);
            const color = avatarColors[d.id % avatarColors.length];
            const slots = openToday[d.id] ?? null;
            return (
              <div className="doctor-card" key={d.id}>
                <div className="doctor-head">
                  <div className="avatar" style={{ background: color }}>
                    {initials(d.name)}
                  </div>
                  <div>
                    <div className="doctor-name">{d.name}</div>
                    <div className="doctor-role">{d.role}</div>
                  </div>
                </div>
                <div className="doctor-rating">
                  <Icon name="star" size={13} /> {d.rating} · {dept ? dept.name : ''}
                </div>
                <div className="doctor-meta-row">
                  <span>{d.exp} yrs experience</span>
                  <span>{d.days.length} days/week</span>
                </div>
                <div className="avail-badge">
                  <span className="avail-dot" style={{ background: slots > 0 ? 'var(--blue)' : '#c8c8c8' }} />
                  {slots === null ? '…' : slots > 0 ? `${slots} slots open today` : 'Fully booked today'}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => quickBookDoctor(d.id, d.dept)}>
                  Book with {d.name.split(' ')[1]}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
