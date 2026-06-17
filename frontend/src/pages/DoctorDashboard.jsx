import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, Check, X, Clipboard, Eye, Plus, Trash2, 
  ShieldCheck, AlertTriangle, FileText, CheckCircle 
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Availability setup
  const [newSlot, setNewSlot] = useState('');
  const [slotSuccess, setSlotSuccess] = useState(false);

  // Modal: Prescription and Notes
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Modal: Patient Documents Inspection
  const [activePatient, setActivePatient] = useState(null);
  const [patientDocs, setPatientDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      setError('Could not retrieve consultation schedules.');
    } finally {
      setLoading(false);
    }
  };

  // Change Appointment Status (Confirm/Cancel/Complete)
  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await api.put(`/appointments/${appId}`, { status });
      setAppointments(prev =>
        prev.map(app => app._id === appId ? res.data.data : app)
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating appointment state.');
    }
  };

  // Open Notes Modal
  const openNotesModal = (app) => {
    setActiveAppointment(app);
    setNotes(app.notes || '');
    setPrescription(app.prescription || '');
  };

  // Submit Notes / Prescription
  const handleSaveNotes = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await api.put(`/appointments/${activeAppointment._id}`, {
        notes,
        prescription,
        status: 'completed' // auto-complete appointment
      });
      
      setAppointments(prev =>
        prev.map(app => app._id === activeAppointment._id ? res.data.data : app)
      );
      
      setActiveAppointment(null);
    } catch (err) {
      console.error('Error saving clinical notes:', err);
      alert('Failed to update clinical record.');
    } finally {
      setModalLoading(false);
    }
  };

  // Open Patient Documents Inspector
  const openDocsInspector = async (patient) => {
    setActivePatient(patient);
    setPatientDocs([]);
    setDocsLoading(true);
    setDocsError('');

    try {
      const res = await api.get('/documents', {
        params: { patientId: patient._id }
      });
      setPatientDocs(res.data.data);
    } catch (err) {
      console.error('Error fetching patient records:', err);
      setDocsError('Access Denied or database issue reading patient files.');
    } finally {
      setDocsLoading(false);
    }
  };

  // Add Availability Slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.trim()) return;

    // Validate format (e.g. "Monday 14:00")
    const updatedAvailability = [...user.availability, newSlot.trim()];
    
    try {
      await api.put('/doctors/profile', { availability: updatedAvailability });
      await refreshUser();
      setNewSlot('');
      setSlotSuccess(true);
      setTimeout(() => setSlotSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update availability:', err);
      alert('Error adding slot.');
    }
  };

  // Remove Availability Slot
  const handleRemoveSlot = async (slotToRemove) => {
    const updatedAvailability = user.availability.filter(slot => slot !== slotToRemove);
    try {
      await api.put('/doctors/profile', { availability: updatedAvailability });
      await refreshUser();
    } catch (err) {
      console.error('Failed to remove slot:', err);
      alert('Error removing availability slot.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="text-center" style={{ padding: '3rem' }}>Loading doctor portal...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
          Clinical Portal
        </h1>
        
        {user.isVerified ? (
          <span className="badge badge-completed flex items-center gap-1">
            <ShieldCheck size={14} /> Verified Practitioner
          </span>
        ) : (
          <span className="badge badge-pending flex items-center gap-1">
            <AlertTriangle size={14} /> Profile Pending Admin Approval
          </span>
        )}
      </div>

      <div className="dashboard-grid">
        
        {/* Left Side: Sidebar for Profile and Availability */}
        <div className="dashboard-sidebar">
          
          <div className="card text-center">
            <div className="avatar-large" style={{ margin: '0 auto 1.25rem' }}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user.email}</p>
            <span className="user-tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
              {user.specialization || 'General Practitioner'}
            </span>
          </div>

          {/* Availability Slot Manager */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: '#0ea5e9' }} />
              <span>Manage Availability</span>
            </h3>

            {slotSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#8af4cc', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.775rem', marginBottom: '0.75rem' }}>
                Slot added successfully.
              </div>
            )}

            <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="e.g. Monday 14:00"
                className="form-control"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                style={{ padding: '0.5rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>
                <Plus size={18} />
              </button>
            </form>

            <span className="form-label" style={{ marginBottom: '0.5rem' }}>Active Hours / Slots</span>
            {user.availability && user.availability.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {user.availability.map((slot) => (
                  <div 
                    key={slot} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <span>{slot}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSlot(slot)}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>No consultation slots configured.</p>
            )}
          </div>

        </div>

        {/* Right Side: Appointment Schedules */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: '#8b5cf6' }} />
            <span>Consultation Schedule</span>
          </h3>

          {appointments.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic', padding: '1.5rem 0' }}>
              No appointments are currently scheduled.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Medical Profile</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{app.patient.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.patient.email}</div>
                      </td>
                      <td>{formatDate(app.date)}</td>
                      <td>{app.timeSlot}</td>
                      <td>
                        <span className={`badge badge-${app.status}`}>{app.status}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => openDocsInspector(app.patient)}
                          className="btn btn-secondary btn-sm flex items-center gap-1"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          <Eye size={12} />
                          <span>Inspect files</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'confirmed')}
                                className="btn btn-success btn-sm"
                                style={{ padding: '0.35rem 0.5rem' }}
                                title="Confirm visit"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'cancelled')}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.35rem 0.5rem' }}
                                title="Decline appointment"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          
                          {app.status === 'confirmed' && (
                            <button
                              onClick={() => openNotesModal(app)}
                              className="btn btn-primary btn-sm flex items-center gap-1"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            >
                              <Clipboard size={12} />
                              <span>Diagnose / Rx</span>
                            </button>
                          )}

                          {app.status === 'completed' && (
                            <button
                              onClick={() => openNotesModal(app)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            >
                              View Diagnosis
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: DIAGNOSIS & PRESCRIPTION INPUT */}
      {activeAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Consultation Clinical Record
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Patient: <strong>{activeAppointment.patient.name}</strong> | Slot: {activeAppointment.timeSlot}
            </p>

            <form onSubmit={handleSaveNotes}>
              <div className="form-group">
                <label className="form-label">Diagnosis / Consultation Notes</label>
                <textarea
                  className="form-control"
                  rows="4"
                  required
                  placeholder="Record symptoms, diagnostics, advice..."
                  style={{ resize: 'vertical' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Prescribed Medicines (Rx)</label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg BID x7 days"
                  className="form-control"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setActiveAppointment(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn btn-success btn-sm"
                >
                  {modalLoading ? 'Saving Record...' : 'Complete Visit & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PATIENT MEDICAL RECORD INSPECTOR */}
      {activePatient && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Patient Health Vault File Inspection
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Patient: <strong>{activePatient.name}</strong> | Blood: {activePatient.bloodGroup || 'Unspecified'}
            </p>

            {/* Medical disclosures */}
            <div className="form-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Declared Medical History</label>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{activePatient.medicalHistory || 'No medical history declared.'}</p>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Uploaded Laboratory Reports / Prescriptions</h4>

            {docsLoading ? (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading vaults files...</p>
            ) : docsError ? (
              <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '4px', padding: '0.75rem', color: '#ff859b', fontSize: '0.85rem' }}>
                {docsError}
              </div>
            ) : patientDocs.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>No clinical files uploaded by patient.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {patientDocs.map((doc) => (
                  <div key={doc._id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.5rem', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={doc.name}>
                        {doc.name}
                      </div>
                      <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', border: 'none' }}>
                        {doc.type}
                      </span>
                    </div>
                    <a
                      href={`http://localhost:5000${doc.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setActivePatient(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
