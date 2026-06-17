import React, { useState, useEffect, useRef } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { 
  Calendar, FileText, UploadCloud, Trash2, Heart, 
  Activity, Phone, User, LogOut, CheckCircle, AlertTriangle 
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [error, setError] = useState('');
  
  // File Upload states
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('report');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const fileInputRef = useRef(null);

  // Load patient data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, docRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/documents')
        ]);
        setAppointments(appRes.data.data);
        setDocuments(docRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Error loading records. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cancel Appointment
  const handleCancelAppointment = async (appId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const res = await api.put(`/appointments/${appId}`, { status: 'cancelled' });
      // Update local state
      setAppointments(prev => 
        prev.map(app => app._id === appId ? { ...app, status: 'cancelled' } : app)
      );
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      alert('Error updating appointment status. Please try again.');
    }
  };

  // Upload Document Submit
  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess(false);

    if (!selectedFile) {
      setUploadError('Please select a PDF or Image file first.');
      return;
    }

    setDocLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', docName || selectedFile.name);
    formData.append('type', docType);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update documents gallery state
      setDocuments(prev => [res.data.data, ...prev]);
      
      // Reset upload inputs
      setDocName('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadSuccess(true);
    } catch (err) {
      console.error('File upload error:', err);
      const errMsg = err.response?.data?.message || 'Failed to upload document. Limit 10MB (PDF/JPG/PNG).';
      setUploadError(errMsg);
    } finally {
      setDocLoading(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this health document permanently?')) return;

    try {
      await api.delete(`/documents/${docId}`);
      setDocuments(prev => prev.filter(doc => doc._id !== docId));
    } catch (err) {
      console.error('Error removing document:', err);
      alert('Failed to remove document record.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="text-center" style={{ padding: '3rem' }}>Loading patient portal...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: '#f8fafc' }}>
        Patient Health Portal
      </h1>

      {error && (
        <div className="card text-center" style={{ borderLeft: '4px solid var(--color-danger)', marginBottom: '2rem' }}>
          <p style={{ color: '#ff859b' }}>{error}</p>
        </div>
      )}

      <div className="dashboard-grid">
        
        {/* Left Side: Patient Health Profile Card */}
        <div className="dashboard-sidebar">
          
          <div className="card profile-card">
            <div className="avatar-large">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user.name}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{user.email}</p>
            
            <span className="user-tag" style={{ marginBottom: '1.5rem' }}>Patient Account</span>

            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', textAlign: 'left' }}>
              
              <div style={{ marginBottom: '1rem' }}>
                <span className="form-label" style={{ marginBottom: '0.15rem' }}>Blood Group</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{user.bloodGroup || 'Not Provided'}</span>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '0.15rem' }}>Medical Disclosures</span>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  {user.medicalHistory || 'No medical history disclosed.'}
                </p>
              </div>

            </div>
          </div>

          {/* Secure Document Upload Box */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={18} style={{ color: '#0ea5e9' }} />
              <span>Upload Health Records</span>
            </h3>

            {uploadSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#8af4cc', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={14} /> Record uploaded successfully!
              </div>
            )}

            {uploadError && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#ff859b', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={14} /> {uploadError}
              </div>
            )}

            <form onSubmit={handleFileUpload}>
              <div className="form-group">
                <label className="form-label">Record Title</label>
                <input
                  type="text"
                  placeholder="e.g. Blood Test, X-Ray Report"
                  className="form-control"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Record Type</label>
                <select 
                  className="form-control"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="report">Diagnostic Report</option>
                  <option value="prescription">Doctor Prescription</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select File (PDF or Image)</label>
                <input
                  type="file"
                  required
                  ref={fileInputRef}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-control"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ padding: '0.5rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={docLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem' }}
              >
                {docLoading ? 'Uploading File...' : 'Upload File'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Appointments Table and Document Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Appointments Block */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} style={{ color: '#8b5cf6' }} />
              <span>Consultation Schedule</span>
            </h3>

            {appointments.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic', padding: '1rem 0' }}>
                No consultations booked. Go back to the directory to schedule one.
              </p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Practitioner</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Status</th>
                      <th>Diagnosis / Notes</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{app.doctor.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.doctor.specialization}</div>
                        </td>
                        <td>{formatDate(app.date)}</td>
                        <td>{app.timeSlot}</td>
                        <td>
                          <span className={`badge badge-${app.status}`}>{app.status}</span>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.notes || (app.status === 'completed' ? 'Click to read' : 'Pending visit')}
                          {app.prescription && (
                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem' }}>
                              Rx: {app.prescription}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {(app.status === 'pending' || app.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancelAppointment(app._id)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Document Gallery Block */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: '#10b981' }} />
              <span>Medical Records Vault</span>
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Access, review, or remove your uploaded laboratory reports and clinical prescriptions.
            </p>

            {documents.length === 0 ? (
              <div style={{ border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                <FileText size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ fontStyle: 'italic' }}>No documents stored in vault.</p>
              </div>
            ) : (
              <div className="document-grid">
                {documents.map((doc) => (
                  <div key={doc._id} className="doc-card">
                    <FileText className="doc-icon" />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', lineBreak: 'anywhere', margin: '0.25rem 0' }}>
                      {doc.name}
                    </h4>
                    <span className="badge" style={{
                      fontSize: '0.7rem',
                      background: doc.type === 'prescription' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                      color: doc.type === 'prescription' ? '#10b981' : '#a78bfa'
                    }}>
                      {doc.type}
                    </span>
                    <div className="doc-actions">
                      <a
                        href={`http://localhost:5000${doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, padding: '0.35rem 0', fontSize: '0.775rem' }}
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteDoc(doc._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.5rem' }}
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
