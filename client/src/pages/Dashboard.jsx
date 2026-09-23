
import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import Icon from "../components/Icon.jsx";

const FAQS = [
  {
    q: "How do I book an appointment?",
    a: "Choose a department or doctor, select an available time slot, and confirm your appointment.",
  },
  {
    q: "Can I cancel my appointment?",
    a: "Yes. Open your appointments and use the cancellation option for an eligible appointment.",
  },
  {
    q: "How can I find a doctor?",
    a: "Use the Doctors section or select a department to view available doctors.",
  },
  {
    q: "Can I see my appointment history?",
    a: "Yes. Your previous and upcoming appointments are available in the appointments section.",
  },
];

function SafeArray(value) {
  return Array.isArray(value) ? value : [];
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

  const [stats, setStats] = useState({});
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const safeDepartments = SafeArray(departments);
  const safeDoctors = SafeArray(doctors);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);

      try {
        const results = await Promise.allSettled([
          api.get("/stats"),
          api.get("/appointments/today"),
          api.get("/appointments"),
        ]);

        if (!mounted) return;

        const statsResult = results[0];
        const todayResult = results[1];
        const appointmentsResult = results[2];

        if (statsResult.status === "fulfilled") {
          const data = statsResult.value?.data;

          if (data && typeof data === "object" && !Array.isArray(data)) {
            setStats(data);
          } else {
            setStats({});
          }
        }

        if (todayResult.status === "fulfilled") {
          const data = todayResult.value?.data;

          if (Array.isArray(data)) {
            setTodayAppointments(data);
          } else if (Array.isArray(data?.appointments)) {
            setTodayAppointments(data.appointments);
          } else {
            setTodayAppointments([]);
          }
        }

        if (appointmentsResult.status === "fulfilled") {
          const data = appointmentsResult.value?.data;

          if (Array.isArray(data)) {
            setAllAppointments(data);
          } else if (Array.isArray(data?.appointments)) {
            setAllAppointments(data.appointments);
          } else {
            setAllAppointments([]);
          }
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);

        if (mounted) {
          setStats({});
          setTodayAppointments([]);
          setAllAppointments([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [api]);

  const sortedToday = useMemo(() => {
    const items = SafeArray(todayAppointments);

    return [...items]
      .sort((a, b) => {
        const timeA = String(a?.time || a?.appointmentTime || "");
        const timeB = String(b?.time || b?.appointmentTime || "");

        return timeA.localeCompare(timeB);
      })
      .slice(0, 6);
  }, [todayAppointments]);

  const recentAppointments = useMemo(() => {
    const items = SafeArray(allAppointments);

    return [...items]
      .sort((a, b) => {
        const dateA = new Date(
          a?.date || a?.appointmentDate || a?.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b?.date || b?.appointmentDate || b?.createdAt || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [allAppointments]);

  const doctorsToday = Number(
    stats?.doctorsToday ??
      stats?.todayDoctors ??
      stats?.activeDoctors ??
      safeDoctors.length ??
      0
  );

  const todayCount = Number(
    stats?.todayAppointments ??
      stats?.appointmentsToday ??
      todayAppointments.length ??
      0
  );

  const totalDepartments = Number(
    stats?.departments ??
      stats?.totalDepartments ??
      safeDepartments.length ??
      0
  );

  const totalDoctors = Number(
    stats?.doctors ??
      stats?.totalDoctors ??
      safeDoctors.length ??
      0
  );

  const openToday = Number(
    stats?.openToday ??
      stats?.availableToday ??
      stats?.availableDoctors ??
      doctorsToday ??
      0
  );

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const source =
      stats?.weeklyAppointments ||
      stats?.weekly ||
      stats?.week ||
      stats?.appointmentVolume;

    if (Array.isArray(source)) {
      return days.map((day, index) => {
        const item = source[index];

        if (typeof item === "number") {
          return {
            day,
            value: item,
          };
        }

        if (item && typeof item === "object") {
          return {
            day: item.day || item.label || day,
            value: Number(item.value ?? item.count ?? item.appointments ?? 0),
          };
        }

        return {
          day,
          value: 0,
        };
      });
    }

    return days.map((day) => ({
      day,
      value: 0,
    }));
  }, [stats]);

  const maxWeeklyValue = Math.max(
    ...weeklyData.map((item) => Number(item.value) || 0),
    1
  );

  function getDoctorName(appointment) {
    return (
      appointment?.doctor?.name ||
      appointment?.doctorName ||
      appointment?.doctor?.fullName ||
      "Doctor"
    );
  }

  function getDepartmentName(appointment) {
    return (
      appointment?.department?.name ||
      appointment?.departmentName ||
      appointment?.department ||
      "General"
    );
  }

  function getPatientName(appointment) {
    return (
      appointment?.patient?.name ||
      appointment?.patientName ||
      currentPatient?.name ||
      "Patient"
    );
  }

  function getAppointmentTime(appointment) {
    return (
      appointment?.time ||
      appointment?.appointmentTime ||
      appointment?.slot ||
      "--"
    );
  }

  function getAppointmentStatus(appointment) {
    return (
      appointment?.status ||
      appointment?.appointmentStatus ||
      "Scheduled"
    );
  }

  function formatDate(value) {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function handleDepartmentBooking(department) {
    try {
      if (typeof quickBookDept === "function") {
        quickBookDept(department);
        return;
      }

      if (typeof startBooking === "function") {
        startBooking({
          departmentId: department?._id || department?.id,
          department,
        });
        return;
      }

      if (typeof showToast === "function") {
        showToast("Please open the booking page to continue.");
      }
    } catch (error) {
      console.error("Booking error:", error);

      if (typeof showToast === "function") {
        showToast("Unable to start booking.");
      }
    }
  }

  return (
    <div className="dashboard-page">
      {/* HERO */}
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">LifeCare Hospital</p>

          <h1>
            Welcome
            {currentPatient?.name ? `, ${currentPatient.name}` : ""}
          </h1>

          <p>
            Manage your appointments, find doctors, and access hospital
            services from one place.
          </p>

          <div className="dashboard-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                if (typeof startBooking === "function") {
                  startBooking();
                }
              }}
            >
              <Icon name="calendar" />
              Book Appointment
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                window.location.href = "/doctors";
              }}
            >
              <Icon name="user-md" />
              Find a Doctor
            </button>
          </div>
        </div>

        <div className="dashboard-hero-icon">
          <Icon name="hospital" />
        </div>
      </section>

      {/* STATS */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="calendar" />
          </div>

          <div>
            <span>Today's Appointments</span>
            <strong>{loading ? "..." : todayCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="user-md" />
          </div>

          <div>
            <span>Total Doctors</span>
            <strong>{loading ? "..." : totalDoctors}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="hospital" />
          </div>

          <div>
            <span>Departments</span>
            <strong>{loading ? "..." : totalDepartments}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="clock" />
          </div>

          <div>
            <span>Available Today</span>
            <strong>{loading ? "..." : openToday}</strong>
          </div>
        </div>
      </section>

      {/* WEEKLY APPOINTMENTS */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Weekly Appointment Volume</h2>
            <p>Appointment activity during the week.</p>
          </div>
        </div>

        <div className="weekly-chart">
          {weeklyData.map((item, index) => {
            const value = Number(item.value) || 0;

            const height =
              value === 0
                ? 8
                : Math.max((value / maxWeeklyValue) * 100, 12);

            return (
              <div className="weekly-column" key={`${item.day}-${index}`}>
                <div className="weekly-value">{value}</div>

                <div className="weekly-bar-wrapper">
                  <div
                    className="weekly-bar"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span>{item.day}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* TODAY'S SCHEDULE */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Today's Schedule</h2>
            <p>Upcoming appointments for today.</p>
          </div>

          <button
            type="button"
            className="text-btn"
            onClick={() => {
              window.location.href = "/appointments";
            }}
          >
            View All
          </button>
        </div>

        {sortedToday.length === 0 ? (
          <div className="empty-state">
            <Icon name="calendar" />

            <h3>No appointments today</h3>

            <p>
              There are no appointments scheduled for today.
            </p>
          </div>
        ) : (
          <div className="appointment-list">
            {sortedToday.map((appointment, index) => (
              <div
                className="appointment-card"
                key={
                  appointment?._id ||
                  appointment?.id ||
                  `today-${index}`
                }
              >
                <div className="appointment-time">
                  <strong>{getAppointmentTime(appointment)}</strong>
                </div>

                <div className="appointment-info">
                  <h3>{getDoctorName(appointment)}</h3>

                  <p>{getDepartmentName(appointment)}</p>

                  <small>
                    Patient: {getPatientName(appointment)}
                  </small>
                </div>

                <span className="appointment-status">
                  {getAppointmentStatus(appointment)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DEPARTMENTS */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Our Departments</h2>
            <p>Choose a department to find the right specialist.</p>
          </div>

          <button
            type="button"
            className="text-btn"
            onClick={() => {
              window.location.href = "/departments";
            }}
          >
            View All
          </button>
        </div>

        {safeDepartments.length === 0 ? (
          <div className="empty-state">
            <Icon name="hospital" />

            <h3>No departments available</h3>

            <p>Please try again later.</p>
          </div>
        ) : (
          <div className="department-grid">
            {safeDepartments.slice(0, 6).map((department, index) => (
              <div
                className="department-card"
                key={
                  department?._id ||
                  department?.id ||
                  `department-${index}`
                }
              >
                <div className="department-icon">
                  <Icon name="hospital" />
                </div>

                <h3>
                  {department?.name ||
                    department?.title ||
                    "Department"}
                </h3>

                <p>
                  {department?.description ||
                    "Specialized healthcare services and expert doctors."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handleDepartmentBooking(department)
                  }
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT APPOINTMENTS */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Recent Appointments</h2>
            <p>Your latest appointment activity.</p>
          </div>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="empty-state">
            <Icon name="calendar" />

            <h3>No recent appointments</h3>

            <p>Your appointment history will appear here.</p>
          </div>
        ) : (
          <div className="appointment-list">
            {recentAppointments.map((appointment, index) => (
              <div
                className="appointment-card"
                key={
                  appointment?._id ||
                  appointment?.id ||
                  `recent-${index}`
                }
              >
                <div className="appointment-info">
                  <h3>{getDoctorName(appointment)}</h3>

                  <p>{getDepartmentName(appointment)}</p>

                  <small>
                    {formatDate(
                      appointment?.date ||
                        appointment?.appointmentDate ||
                        appointment?.createdAt
                    )}
                  </small>
                </div>

                <span className="appointment-status">
                  {getAppointmentStatus(appointment)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions.</p>
          </div>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, index) => (
            <details key={index} className="faq-item">
              <summary>
                <span>{faq.q}</span>
                <Icon name="chevron-down" />
              </summary>

              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* EMERGENCY */}
      <section className="emergency-section">
        <div>
          <p className="emergency-label">Emergency Services</p>

          <h2>Need urgent medical assistance?</h2>

          <p>
            For medical emergencies, contact the hospital emergency
            department immediately.
          </p>
        </div>

        <a href="tel:108" className="emergency-btn">
          <Icon name="phone" />
          Call 108
        </a>
      </section>
    </div>
  );
}
