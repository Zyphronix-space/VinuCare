import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';

const API_BASE = `${API_BASE_URL}/api/admin/doctors/scheduling`;

export default function AdminScheduling() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_BASE, { credentials: 'include' });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        setDoctors(await res.json());
      } catch (err) {
        console.error('Failed to load scheduling overview:', err);
        setError('Failed to load scheduling overview: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Doctor Scheduling</h1>
          <p>Upcoming appointment load and blocked dates across every doctor on the roster.</p>
        </div>
      </div>

      <div className="admin-panel">
        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Upcoming Appointments (14d)</th>
                  <th>Upcoming Blocked Dates</th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={4} /> : (
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id}>
                    <td className="admin-cell-main">{d.name}</td>
                    <td>{d.specialty || '—'}</td>
                    <td>{d.upcomingAppointments}</td>
                    <td>
                      {d.upcomingUnavailableDates.length === 0
                        ? '—'
                        : d.upcomingUnavailableDates.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && doctors.length === 0 && <div className="admin-empty">No doctors on the roster yet.</div>}
          </div>
        )}
      </div>
    </>
  );
}
