const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get dashboard metrics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingVerifications = await User.countDocuments({ role: 'doctor', isVerified: false });
    
    // Recent activity list
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          pendingVerifications
        },
        recentAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctors pending verification
// @route   GET /api/admin/pending-doctors
// @access  Private (Admin only)
const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({ role: 'doctor', isVerified: false }).select('-password');
    res.json({ success: true, count: pendingDoctors.length, data: pendingDoctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/verify a doctor profile
// @route   PUT /api/admin/verify-doctor/:id
// @access  Private (Admin only)
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor account not found' });
    }

    doctor.isVerified = true;
    await doctor.save();

    res.json({
      success: true,
      message: `Doctor ${doctor.name} has been successfully verified`,
      data: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        isVerified: doctor.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getPendingDoctors,
  verifyDoctor
};
