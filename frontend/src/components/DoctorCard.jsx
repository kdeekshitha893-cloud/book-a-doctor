import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Calendar, ChevronRight } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
            {doctor.name}
          </h3>
          <span className="user-tag" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', borderColor: 'rgba(14, 165, 233, 0.2)' }}>
            {doctor.specialization || 'General Medicine'}
          </span>
        </div>
        
        {doctor.isVerified ? (
          <span className="badge badge-completed" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
            <ShieldCheck size={14} /> Verified
          </span>
        ) : (
          <span className="badge badge-pending">Pending Approval</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <Award size={16} style={{ color: '#8b5cf6' }} />
        <span>{doctor.experience} Years of Clinical Experience</span>
      </div>

      <p style={{ color: '#64748b', fontSize: '0.925rem', marginBottom: '1.5rem', flex: 1, lineBreak: 'anywhere' }}>
        {doctor.bio ? (doctor.bio.length > 120 ? `${doctor.bio.substring(0, 120)}...` : doctor.bio) : 'No biography provided.'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Calendar size={14} />
          {doctor.availability ? doctor.availability.length : 0} slots available
        </span>
        
        <Link 
          to={`/doctors/${doctor._id}`} 
          className="btn btn-primary btn-sm"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          <span>View Profile</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
