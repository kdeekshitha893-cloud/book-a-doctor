import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, LayoutDashboard, Search, FileText, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Activity size={28} className="text-primary" />
          <span>MedConnect</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Browse Doctors
          </Link>

          {user ? (
            <>
              {/* Dashboard Link based on Role */}
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''} flex items-center gap-2`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <span className="user-tag flex items-center gap-1">
                  <User size={12} />
                  {user.role}
                </span>
                
                <span className="text-secondary font-medium">
                  {user.name.split(' ')[0]}
                </span>
                
                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
