import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Award, Phone, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking states
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Load doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data.data);
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        setError('Doctor profile not found or server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
  }, [id]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please select an appointment time slot.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(false);

    try {
      await api.post('/appointments', {
        doctorId: id,
        date: bookingDate,
        timeSlot: selectedSlot
      });
      setBookingSuccess(true);
      setSelectedSlot('');
    } catch (err) {
      console.error('Error booking appointment:', err);
      const errMsg = err.response?.data?.message || 'Failed to book slot. It might be taken.';
      setBookingError(errMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center" style={{ padding: '3rem' }}>Loading practitioner profile...</div>;
  }

  if (error || !doctor) {
    return (
      <div className="card text-center" style={{ borderLeft: '4px solid var(--color-danger)', padding: '2rem' }}>
        <AlertTriangle size={36} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
        <p style={{ color: '#ff859b', marginBottom: '1rem' }}>{error || 'Doctor not found.'}</p>
        <Link to="/" className="btn btn-secondary">Back to Directory</Link>
      </div>
    );
  }

  // Group slots by day of week for helpful rendering
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <Link to="/" style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}>
        &larr; Back to Directory
      </Link>

      <div className="dashboard-grid">
        
        {/* Left Side: Profile Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card text-center" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="avatar-large" style={{ margin: '0 auto 1.5rem' }}>
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
              {doctor.name}
            </h2>
            
            <p className="user-tag" style={{
              background: 'rgba(14, 165, 233, 0.1)',
              color: '#38bdf8',
              borderColor: 'rgba(14, 165, 233, 0.2)',
              alignSelf: 'center',
              marginBottom: '1rem'
            }}>
              {doctor.specialization || 'General Practitioner'}
            </p>

            {doctor.isVerified ? (
              <span className="badge badge-completed" style={{ display: 'inline-flex', gap: '0.25rem', alignSelf: 'center' }}>
                <ShieldCheck size={14} /> Verified Practitioner
              </span>
            ) : (
              <span className="badge badge-pending" style={{ alignSelf: 'center' }}>Pending Platform Verification</span>
            )}

            <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '1.5rem 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', fontSize: '0.925rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#94a3b8' }}>
                <Award size={18} style={{ color: '#8b5cf6' }} />
                <span>{doctor.experience} Years of Clinical Practice</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#94a3b8' }}>
                <Phone size={18} style={{ color: '#0ea5e9' }} />
                <span>{doctor.phone || 'No contact provided'}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Biography & Background</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {doctor.bio || `${doctor.name} is a dedicated health professional specializing in ${doctor.specialization || 'General Medicine'}.`}
            </p>
          </div>

        </div>

        {/* Right Side: Appointment Booking Widget */}
        <div className="dashboard-sidebar">
          
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} style={{ color: '#0ea5e9' }} />
              <span>Schedule Consultation</span>
            </h3>

            {/* Check role & verification status */}
            {!user ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.925rem', marginBottom: '1.5rem' }}>
                  Please register or log in as a patient to schedule an appointment.
                </p>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                  Log In to Book
                </Link>
              </div>
            ) : user.role !== 'patient' ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.9rem'
              }}>
                <InfoIcon /> Booking is only available for Patient accounts. Logged in as: <strong>{user.role}</strong>
              </div>
            ) : !doctor.isVerified ? (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                color: '#fdba74',
                fontSize: '0.9rem'
              }}>
                <AlertTriangle size={18} style={{ marginBottom: '0.5rem' }} />
                <p>Appointments cannot be scheduled with unverified doctors. Admin verification is currently pending for this doctor.</p>
              </div>
            ) : (
              // Booking Form for Patients
              <form onSubmit={handleBookAppointment}>
                {bookingSuccess && (
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
                    <span>Appointment booked! Check your dashboard.</span>
                  </div>
                )}

                {bookingError && (
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    color: '#ff859b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    marginBottom: '1.5rem'
                  }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="book-date">1. Choose Consultation Date</label>
                  <input
                    id="book-date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-control"
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setSelectedSlot('');
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">2. Select Availability Slot</label>
                  {doctor.availability && doctor.availability.length > 0 ? (
                    <div className="slots-grid">
                      {doctor.availability.map((slot) => {
                        // Display clean time from slot string (e.g. "Monday 10:00")
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <Clock size={12} style={{ marginRight: '0.2rem' }} />
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>
                      No active slots defined by practitioner.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {bookingLoading ? 'Processing Request...' : 'Confirm Appointment'}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

const InfoIcon = () => (
  <svg style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default DoctorProfile;
