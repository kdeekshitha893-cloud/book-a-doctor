import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import DoctorCard from '../components/DoctorCard';
import { Search, Stethoscope, CheckCircle, Info } from 'lucide-react';

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');

  // Fetch doctors list on load and filters change
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await api.get('/doctors', {
          params: { search, specialization }
        });
        setDoctors(res.data.data);
      } catch (err) {
        console.error('Failed to load doctors:', err);
        setError('Unable to fetch clinical profiles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchDoctors();
    }, 400); // 400ms debouncing

    return () => clearTimeout(delayDebounce);
  }, [search, specialization]);

  const specialties = [
    'Cardiology',
    'Pediatrics',
    'General Medicine',
    'Dermatology',
    'Neurology',
    'Orthopedics'
  ];

  return (
    <div>
      {/* Platform Banner Header */}
      <header className="card" style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        textAlign: 'center',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        <Stethoscope size={48} style={{ color: '#0ea5e9', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Your Health, Connected.
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto', fontSize: '1.1rem' }}>
          Schedule appointments, consult with verified medical specialists, and upload clinical files securely in a unified environment.
        </p>
      </header>

      {/* Filter and Search Controls */}
      <section className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem'
        }} className="dashboard-grid">
          
          {/* Text Search */}
          <div className="form-group" style={{ margin: 0, position: 'relative' }}>
            <label className="form-label">Search Clinical Profiles</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by doctor's name or keywords..."
                className="form-control"
                style={{ paddingLeft: '2.75rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
            </div>
          </div>

          {/* Specialty Dropdown */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Clinical Specialty</label>
            <select
              className="form-control"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">All Specialties</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

        </div>
      </section>

      {/* Profile Listings */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#f8fafc' }}>
        Available Practitioners
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(14, 165, 233, 0.1)',
            borderTopColor: '#0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <span>Searching clinic directory...</span>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : error ? (
        <div className="card text-center" style={{ borderLeft: '4px solid var(--color-danger)', padding: '2rem' }}>
          <p style={{ color: '#ff859b' }}>{error}</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <Info size={36} style={{ color: '#64748b', marginBottom: '1rem' }} />
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No clinical profiles matched your search parameters.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
