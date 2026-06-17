import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { 
  Users, Stethoscope, Calendar, ShieldCheck, AlertTriangle, 
  Clock, CheckCircle, ListTodo, Activity 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Verification action states
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-doctors')
      ]);
      setStats(statsRes.data.data.stats);
      setRecentAppointments(statsRes.data.data.recentAppointments);
      setPendingDoctors(pendingRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin metrics:', err);
      setError('Access denied or database query error.');
    } finally {
      setLoading(false);
    }
  };

  // Verify doctor handler
  const handleVerifyDoctor = async (doctorId) => {
    setActionLoadingId(doctorId);
    setActionSuccess('');
    try {
      const res = await api.put(`/admin/verify-doctor/${doctorId}`);
      setActionSuccess(res.data.message);
      
      // Update local states
      setPendingDoctors(prev => prev.filter(doc => doc._id !== doctorId));
      
      // Refetch stats to update totals
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.data.stats);
    } catch (err) {
      console.error('Error verifying doctor:', err);
      alert('Failed to update doctor verification status.');
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="text-center" style={{ padding: '3rem' }}>Loading platform logs...</div>;
  }

  if (error || !stats) {
    return (
      <div className="card text-center" style={{ borderLeft: '4px solid var(--color-danger)', padding: '2rem' }}>
        <AlertTriangle size={36} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
        <p style={{ color: '#ff859b' }}>{error || 'Not authorized to view administration portal.'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: '#f8fafc' }}>
        Platform Monitoring Dashboard
      </h1>

      {actionSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          color: '#8af4cc',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}>
          <CheckCircle size={18} style={{ flexShrink: 0 }} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Grid of Key Platform Metrics */}
      <section className="metrics-grid">
        
        <div className="card metric-card">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-details">
            <h3>Registered Patients</h3>
            <p>{stats.totalPatients}</p>
          </div>
        </div>

        <div className="card metric-card" style={{ borderLeft: '3px solid var(--color-secondary)' }}>
          <div className="metric-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-secondary)' }}>
            <Stethoscope size={24} />
          </div>
          <div className="metric-details">
            <h3>Medical Specialists</h3>
            <p>{stats.totalDoctors}</p>
          </div>
        </div>

        <div className="card metric-card" style={{ borderLeft: '3px solid var(--color-success)' }}>
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
            <Calendar size={24} />
          </div>
          <div className="metric-details">
            <h3>Total Bookings</h3>
            <p>{stats.totalAppointments}</p>
          </div>
        </div>

        <div className="card metric-card" style={{ 
          borderLeft: stats.pendingVerifications > 0 ? '3px solid var(--color-warning)' : '1px solid var(--border-card)'
        }}>
          <div className="metric-icon" style={{ 
            background: stats.pendingVerifications > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
            color: stats.pendingVerifications > 0 ? 'var(--color-warning)' : 'var(--text-muted)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div className="metric-details">
            <h3>Pending Reviews</h3>
            <p style={{ color: stats.pendingVerifications > 0 ? 'var(--color-warning)' : 'inherit' }}>
              {stats.pendingVerifications}
            </p>
          </div>
        </div>

      </section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        marginTop: '2rem'
      }} className="dashboard-grid">
        
        {/* Left Side: Pending Verifications List */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListTodo size={20} style={{ color: '#f59e0b' }} />
            <span>Doctor Profiles Awaiting Verification</span>
          </h3>

          {pendingDoctors.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic', padding: '1.5rem 0' }}>
              No medical specialist registrations are currently pending approval.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Specialist Details</th>
                    <th>Clinical Specialty</th>
                    <th>Experience</th>
                    <th>Contact Phone</th>
                    <th style={{ textAlign: 'right' }}>Approvals</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{doc.email}</div>
                      </td>
                      <td>
                        <span className="user-tag" style={{ background: 'rgba(14, 165, 233, 0.05)', color: '#38bdf8' }}>
                          {doc.specialization}
                        </span>
                      </td>
                      <td>{doc.experience} Years</td>
                      <td>{doc.phone || 'No phone'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleVerifyDoctor(doc._id)}
                          disabled={actionLoadingId === doc._id}
                          className="btn btn-success btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          {actionLoadingId === doc._id ? 'Verifying...' : 'Approve Profile'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Recent Bookings Log */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: '#8b5cf6' }} />
            <span>Recent Platform Activity</span>
          </h3>

          {recentAppointments.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic', padding: '1.5rem 0' }}>
              No booking records registered on the system.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date Scheduled</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 500 }}>{app.patient ? app.patient.name : 'Deleted Patient'}</td>
                      <td style={{ fontWeight: 500 }}>{app.doctor ? app.doctor.name : 'Deleted Doctor'}</td>
                      <td>{formatDate(app.date)}</td>
                      <td>{app.timeSlot}</td>
                      <td>
                        <span className={`badge badge-${app.status}`}>{app.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
