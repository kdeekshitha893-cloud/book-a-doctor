const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Create Express app
const app = express();

// Set CORS middleware
app.use(cors({
  origin: '*', // For development accessibility
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Ensure uploads folder exists and serve it statically
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Route definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MedConnect API service is active' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  
  // Auto-seed function
  await seedDB();

  app.listen(PORT, () => {
    console.log(`MedConnect Backend API running on port ${PORT}`);
  });
};

// Seed database helper
const seedDB = async () => {
  const User = require('./models/User');
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database contains accounts. Skipping seeding.');
      return;
    }

    console.log('Database empty. Seeding initial accounts for evaluation...');

    // 1. Admin account
    await User.create({
      name: 'MedConnect Admin',
      email: 'admin@medconnect.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 999-1111'
    });

    // 2. Verified Doctor
    await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'doctor1@medconnect.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1 (555) 777-2222',
      specialization: 'Cardiology',
      experience: 12,
      bio: 'Board-certified cardiologist specializing in coronary health, heart failure prevention, and echocardiograms.',
      isVerified: true,
      availability: [
        "Monday 09:00", "Monday 10:00", "Monday 11:00",
        "Wednesday 14:00", "Wednesday 15:00", "Wednesday 16:00",
        "Friday 09:00", "Friday 10:00"
      ]
    });

    // 3. Unverified Doctor
    await User.create({
      name: 'Dr. Marcus Vance',
      email: 'doctor2@medconnect.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1 (555) 777-3333',
      specialization: 'Pediatrics',
      experience: 8,
      bio: 'Dedicated pediatrician with special focus on early childhood development and immunizations.',
      isVerified: false, // Default unverified for admin approval demo
      availability: [
        "Tuesday 09:00", "Tuesday 10:00", "Tuesday 11:00",
        "Thursday 14:00", "Thursday 15:00"
      ]
    });

    // 4. Patient
    await User.create({
      name: 'Jane Doe',
      email: 'patient1@medconnect.com',
      password: 'patient123',
      role: 'patient',
      phone: '+1 (555) 777-4444',
      bloodGroup: 'O-Negative',
      medicalHistory: 'Mild asthma, allergy to Penicillin.'
    });

    console.log('==========================================================');
    console.log('DEMO ACCOUNTS SEEDED SUCCESSFULLY:');
    console.log('  Patient:  patient1@medconnect.com  / patient123');
    console.log('  Doctor 1: doctor1@medconnect.com   / doctor123 (Verified)');
    console.log('  Doctor 2: doctor2@medconnect.com   / doctor123 (Needs Verification)');
    console.log('  Admin:    admin@medconnect.com     / admin123');
    console.log('==========================================================');
  } catch (error) {
    console.error('Database seeding error:', error);
  }
};

startServer();
