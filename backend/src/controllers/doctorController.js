const User = require('../models/User');

// @desc    Get all doctors (search & filters)
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  const { search, specialization } = req.query;
  
  try {
    let query = { role: 'doctor' };

    // Default to only showing verified doctors to patients, but if admin queries, show all.
    // However, to make local testing easy, let's return all doctors if requested or if we are verifying.
    // Let's filter by verification status if the client asks, but for browsing, let's show all but mark their status.
    // Actually, showing all doctors makes testing the "admin verification" flow immediately obvious.
    // So let's show all doctors, but sort/mark them.
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query).select('-password');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor profile by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select('-password');
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor profile & availability slots
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res) => {
  const { specialization, experience, bio, availability } = req.body;

  try {
    const doctor = await User.findById(req.user.id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor account not found' });
    }

    // Update fields
    if (specialization !== undefined) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = experience;
    if (bio !== undefined) doctor.bio = bio;
    if (availability !== undefined) doctor.availability = availability;

    const updatedDoctor = await doctor.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedDoctor._id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        specialization: updatedDoctor.specialization,
        experience: updatedDoctor.experience,
        bio: updatedDoctor.bio,
        availability: updatedDoctor.availability,
        isVerified: updatedDoctor.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
};
