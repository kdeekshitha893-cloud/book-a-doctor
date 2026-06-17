const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  phone: {
    type: String,
    trim: true,
  },
  
  // Doctor profile fields
  specialization: {
    type: String,
    default: '',
    trim: true,
  },
  experience: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: function() {
      return this.role !== 'doctor'; // Patients/admins are auto-verified, doctors need admin approval
    },
  },
  availability: {
    type: [String], // Array of slots, e.g. ["Monday 09:00", "Monday 10:00", "Wednesday 14:30"]
    default: [],
  },

  // Patient profile fields
  bloodGroup: {
    type: String,
    default: '',
    trim: true,
  },
  medicalHistory: {
    type: String,
    default: '',
    trim: true,
  }
}, {
  timestamps: true,
});

// Encrypt password using bcrypt before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password input with database hash
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
