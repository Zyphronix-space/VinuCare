import { useEffect, useMemo, useState } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import Skeleton from '../../components/ui/Skeleton';
import '../../styles/doctor-calendar.css';
import { API_BASE_URL } from '../../config/api';

/**
 * DoctorCalendar
 *
 * Month-view calendar of the logged-in doctor's booked appointments.
 * Fetches from GET /api/doctor/appointments (protected — requires the
 * doctor's session cookie, sent automatically by the browser), which already
 * filters to appointments assigned to that doctor and returns them
 * shaped as:
 *   {
 *     id: string,
 *     date: 'YYYY-MM-DD',
 *     time: 'HH:MM',           // 24hr, e.g. '14:30'
 *     patientName: string,     // pet's name
 *     ownerName: string,
 *     reason: string,
 *     status: 'booked' | 'completed' | 'cancelled',
 *   }[]
 */

const API_URL = `${API_BASE_URL}/api/doctor/appointments`;

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_META = {
  booked: { label: 'Booked', className: 'status-booked' },
  completed: { label: 'Completed', className: 'status-completed' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' },
};

function toDateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

const UNAVAILABILITY_URL = `${API_BASE_URL}/api/doctor/unavailability`;
const HOLIDAYS_URL = `${API_BASE_URL}/api/appointments/holidays`;

export default function DoctorCalendar() {
  const { confirm, success, error: notifyError } = useUIFeedback();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    loadAppointments();
    loadUnavailability();
    loadHolidays();
  }, []);

  async function loadHolidays() {
    try {
      const res = await fetch(HOLIDAYS_URL);
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const json = await res.json();
      setHolidays(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error('Failed to load holidays:', err);
      notifyError('Could not load clinic holidays — the calendar may be missing some blocked-out dates.');
    }
  }

  async function loadAppointments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load doctor appointments:', err);
      setError('Failed to load appointments: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadUnavailability() {
    try {
      const res = await fetch(UNAVAILABILITY_URL, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const json = await res.json();
      setUnavailableDates(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error('Failed to load unavailability:', err);
      notifyError('Could not load your unavailable dates — the calendar may show incorrect availability.');
    }
  }

  async function toggleUnavailable(dateKey) {
    const isCurrentlyUnavailable = unavailableDates.includes(dateKey);

    if (!isCurrentlyUnavailable) {
      const bookedCount = (apptsByDate[dateKey] || []).filter((a) => a.status === 'booked').length;
      if (bookedCount > 0) {
        const ok = await confirm({
          title: 'Cancel existing bookings?',
          message: `${bookedCount} appointment${bookedCount === 1 ? '' : 's'} on this day will be cancelled and the owner${bookedCount === 1 ? '' : 's'} emailed to pick a new day. Continue?`,
          confirmLabel: 'Mark Unavailable',
          danger: true,
        });
        if (!ok) return;
      }
    }

    setSavingAvailability(true);
    try {
      if (isCurrentlyUnavailable) {
        await fetch(`${UNAVAILABILITY_URL}/${dateKey}`, { method: 'DELETE', credentials: 'include' });
        setUnavailableDates((prev) => prev.filter((d) => d !== dateKey));
      } else {
        const res = await fetch(UNAVAILABILITY_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateKey }),
        });
        const body = await res.json();
        setUnavailableDates((prev) => [...prev, dateKey]);
        if (body.cancelledCount > 0) {
          await loadAppointments();
          success(`Marked unavailable. ${body.cancelledCount} appointment${body.cancelledCount === 1 ? '' : 's'} cancelled and the owner${body.cancelledCount === 1 ? '' : 's'} notified by email.`);
        }
      }
    } catch (err) {
      console.error('Failed to update availability:', err);
      notifyError('Failed to update availability: ' + err.message);
    } finally {
      setSavingAvailability(false);
    }
  }

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const holidayByDate = useMemo(() => new Map(holidays.map((h) => [h.date, h.name])), [holidays]);

  const apptsByDate = useMemo(() => {
    const map = {};
    for (const appt of data) {
      if (!map[appt.date]) map[appt.date] = [];
      map[appt.date].push(appt);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [data]);

  const todayKey = useMemo(() => {
    const now = new Date();
    return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(cursor.year, cursor.month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const daysInPrevMonth = new Date(cursor.year, cursor.month, 0).getDate();

    const cells = [];

    for (let i = 0; i < startWeekday; i++) {
      const day = daysInPrevMonth - startWeekday + 1 + i;
      const prevMonth = cursor.month === 0 ? 11 : cursor.month - 1;
      const prevYear = cursor.month === 0 ? cursor.year - 1 : cursor.year;
      cells.push({ day, key: toDateKey(prevYear, prevMonth, day), inMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, key: toDateKey(cursor.year, cursor.month, day), inMonth: true });
    }

    while (cells.length % 7 !== 0) {
      const day = cells.length - (startWeekday + daysInMonth) + 1;
      const nextMonth = cursor.month === 11 ? 0 : cursor.month + 1;
      const nextYear = cursor.month === 11 ? cursor.year + 1 : cursor.year;
      cells.push({ day, key: toDateKey(nextYear, nextMonth, day), inMonth: false });
    }

    const result = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, [cursor]);

  function goToPrevMonth() {
    setCursor((c) => {
      const month = c.month === 0 ? 11 : c.month - 1;
      const year = c.month === 0 ? c.year - 1 : c.year;
      return { year, month };
    });
  }

  function goToNextMonth() {
    setCursor((c) => {
      const month = c.month === 11 ? 0 : c.month + 1;
      const year = c.month === 11 ? c.year + 1 : c.year;
      return { year, month };
    });
  }

  function goToToday() {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(todayKey);
  }

  const selectedAppointments = apptsByDate[selectedDate] || [];
  const selectedLabel = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="vc-cal">
        <div className="vc-cal-grid-wrap">
          <div className="vc-cal-header">
            <Skeleton width="160px" height="1.4rem" />
            <Skeleton width="140px" height="2rem" radius="8px" />
          </div>
          <div className="vc-cal-weekdays">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="vc-cal-weekday">{label}</div>
            ))}
          </div>
          <div className="vc-cal-body">
            {Array.from({ length: 5 }).map((_, wi) => (
              <div className="vc-cal-week" key={wi}>
                {Array.from({ length: 7 }).map((_, di) => (
                  <div key={di} style={{ padding: 8 }}>
                    <Skeleton width="100%" height="64px" radius="8px" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <aside className="vc-cal-panel">
          <div className="vc-cal-panel-header">
            <Skeleton width="140px" height="1.1rem" />
          </div>
          <div className="vc-cal-list">
            {[1, 2, 3].map((i) => (
              <div className="vc-cal-list-item" key={i}>
                <Skeleton width="46px" height="0.85rem" />
                <div className="vc-cal-list-main">
                  <Skeleton width="60%" height="0.9rem" style={{ marginBottom: 6 }} />
                  <Skeleton width="80%" height="0.78rem" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vc-cal">
        <div className="vc-cal-grid-wrap">
          <p className="vc-cal-empty" style={{ color: '#A8493A' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vc-cal">
      <div className="vc-cal-grid-wrap">
        <div className="vc-cal-header">
          <h2 className="vc-cal-title">{monthLabel}</h2>
          <div className="vc-cal-nav">
            <button className="vc-cal-nav-btn" onClick={goToPrevMonth} aria-label="Previous month">
              ‹
            </button>
            <button className="vc-cal-today-btn" onClick={goToToday}>
              Today
            </button>
            <button className="vc-cal-nav-btn" onClick={goToNextMonth} aria-label="Next month">
              ›
            </button>
          </div>
        </div>

        <div className="vc-cal-weekdays">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="vc-cal-weekday">
              {label}
            </div>
          ))}
        </div>

        <div className="vc-cal-body">
          {weeks.map((week, wi) => (
            <div className="vc-cal-week" key={wi}>
              {week.map((cell) => {
                const dayAppts = apptsByDate[cell.key] || [];
                const isToday = cell.key === todayKey;
                const isSelected = cell.key === selectedDate;
                const isUnavailable = unavailableDates.includes(cell.key);
                const isHoliday = holidayByDate.has(cell.key);
                const visible = dayAppts.slice(0, 2);
                const overflow = dayAppts.length - visible.length;

                return (
                  <button
                    key={cell.key}
                    title={isHoliday ? `Public holiday: ${holidayByDate.get(cell.key)}` : undefined}
                    className={[
                      'vc-cal-day',
                      !cell.inMonth ? 'vc-cal-day--muted' : '',
                      isToday ? 'vc-cal-day--today' : '',
                      isSelected ? 'vc-cal-day--selected' : '',
                      isUnavailable ? 'vc-cal-day--unavailable' : '',
                      isHoliday ? 'vc-cal-day--holiday' : '',
                    ].join(' ').trim()}
                    onClick={() => setSelectedDate(cell.key)}
                  >
                    <span className="vc-cal-day-num">{cell.day}</span>
                    <span className="vc-cal-day-chips">
                      {visible.map((appt) => (
                        <span
                          key={appt.id}
                          className={`vc-cal-chip ${STATUS_META[appt.status]?.className || ''}`}
                        >
                          {appt.time} {appt.patientName}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span className="vc-cal-chip-more">+{overflow} more</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <aside className="vc-cal-panel">
        <div className="vc-cal-panel-header">
          <h3>{selectedLabel || 'Select a date'}</h3>
          <span className="vc-cal-panel-count">
            {selectedAppointments.length} appointment{selectedAppointments.length === 1 ? '' : 's'}
          </span>
        </div>

        {selectedDate && holidayByDate.has(selectedDate) ? (
          <p className="vc-cal-empty" style={{ marginBottom: 16 }}>
            Public holiday — {holidayByDate.get(selectedDate)}. The clinic is closed, nothing to mark here.
          </p>
        ) : selectedDate && selectedDate >= todayKey && (
          <button
            type="button"
            className={`vc-cal-availability-btn ${unavailableDates.includes(selectedDate) ? 'is-unavailable' : ''}`}
            onClick={() => toggleUnavailable(selectedDate)}
            disabled={savingAvailability}
          >
            {unavailableDates.includes(selectedDate) ? "Mark as available again" : "I'm not available this day"}
          </button>
        )}

        {selectedAppointments.length === 0 ? (
          <p className="vc-cal-empty">Nothing booked for this day.</p>
        ) : (
          <ul className="vc-cal-list">
            {selectedAppointments.map((appt) => (
              <li key={appt.id} className="vc-cal-list-item">
                <div className="vc-cal-list-time">{appt.time}</div>
                <div className="vc-cal-list-main">
                  <div className="vc-cal-list-patient">
                    {appt.patientName}
                    <span className={`vc-cal-status-dot ${STATUS_META[appt.status]?.className || ''}`} />
                  </div>
                  <div className="vc-cal-list-meta">{appt.ownerName} · {appt.reason}</div>
                </div>
                <span className={`vc-cal-status-label ${STATUS_META[appt.status]?.className || ''}`}>
                  {STATUS_META[appt.status]?.label || appt.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}