import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorProfile from './pages/DoctorProfile';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Fallback 404 Route */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
                  <p style={{ color: '#64748b' }}>The requested clinical page could not be located.</p>
                </div>
              } />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
