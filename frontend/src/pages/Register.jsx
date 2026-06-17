import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Stethoscope, AlertTriangle, FileText, Activity } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('patient'); // default 'patient'

  // Patient Specific
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Doctor Specific
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState(0);
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !phone) {
      setError('Please fill in all general fields.');
      return;
    }

    setLoading(true);

    // Build payload based on role
    const payload = {
      name,
      email,
      password,
      phone,
      role
    };

    if (role === 'patient') {
      payload.bloodGroup = bloodGroup;
      payload.medicalHistory = medicalHistory;
    } else if (role === 'doctor') {
      payload.specialization = specialization;
      payload.experience = Number(experience);
      payload.bio = bio;
    }

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{
      maxWidth: '550px',
      margin: '2rem auto',
      width: '100%'
    }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>
          Create an Account
        </h2>
        <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.925rem', marginBottom: '2rem' }}>
          Join MedConnect as a patient or medical doctor
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: '#ff859b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selection toggle */}
          <div className="form-group">
            <label className="form-label">Register As</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="button"
                className={`btn ${role === 'patient' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.65rem' }}
                onClick={() => setRole('patient')}
              >
                <Activity size={18} />
                <span>Patient Portal</span>
              </button>
              
              <button
                type="button"
                className={`btn ${role === 'doctor' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.65rem' }}
                onClick={() => setRole('doctor')}
              >
                <Stethoscope size={18} />
                <span>Doctor / Specialist</span>
              </button>
            </div>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '1.5rem 0' }} />

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-name"
                type="text"
                required
                className="form-control"
                placeholder="Jane Doe"
                style={{ paddingLeft: '2.5rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User size={16} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-email"
                type="email"
                required
                className="form-control"
                placeholder="email@example.com"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-pass">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-pass"
                type="password"
                required
                minLength={6}
                className="form-control"
                placeholder="Min 6 characters"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-phone"
                type="tel"
                required
                className="form-control"
                placeholder="+1 (555) 000-0000"
                style={{ paddingLeft: '2.5rem' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Phone size={16} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
            </div>
          </div>

          {/* Dynamic Patient Fields */}
          {role === 'patient' && (
            <div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-blood">Blood Group (Optional)</label>
                <input
                  id="reg-blood"
                  type="text"
                  className="form-control"
                  placeholder="e.g. O-Positive, A-Negative"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-history">Medical History (Optional)</label>
                <textarea
                  id="reg-history"
                  className="form-control"
                  rows="3"
                  placeholder="Mention active medical conditions, allergies, or past surgeries..."
                  style={{ resize: 'vertical' }}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Dynamic Doctor Fields */}
          {role === 'doctor' && (
            <div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-spec">Clinical Specialty</label>
                <select
                  id="reg-spec"
                  required
                  className="form-control"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="">Select Specialty</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-exp">Years of Experience</label>
                <input
                  id="reg-exp"
                  type="number"
                  required
                  min={0}
                  className="form-control"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-bio">Professional Bio</label>
                <textarea
                  id="reg-bio"
                  required
                  className="form-control"
                  rows="3"
                  placeholder="Introduce yourself, qualifications, and patient care philosophies..."
                  style={{ resize: 'vertical' }}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                fontSize: '0.825rem',
                color: '#fdba74',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                marginBottom: '1.5rem'
              }}>
                <FileText size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <span>Notice: Doctor accounts require verification by our platform administration before becoming searchable and open to bookings.</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.9rem',
          marginTop: '1.5rem'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0ea5e9', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
