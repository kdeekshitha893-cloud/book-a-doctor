const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;

  try {
    // 1. Check if doctor exists and is verified
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!doctor.isVerified) {
      return res.status(400).json({ success: false, message: 'This doctor is not yet verified by the platform admin' });
    }

    // 2. Check if the slot is already booked
    const parsedDate = new Date(date);
    // Standardize date to avoid time discrepancies
    parsedDate.setUTCHours(0,0,0,0);

    const existingBooking = await Appointment.findOne({
      doctor: doctorId,
      date: parsedDate,
      timeSlot,
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'This time slot has already been booked' });
    }

    // 3. Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: parsedDate,
      timeSlot,
      status: 'confirmed' // starts as pending approval or auto-confirmed
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments for current user
// @route   GET /api/appointments
// @access  Private (All roles)
const getAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    // Admin can query all appointments
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone bloodGroup medicalHistory')
      .populate('doctor', 'name email phone specialization bio')
      .sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment details (status, notes, prescription)
// @route   PUT /api/appointments/:id
// @access  Private (Patient/Doctor)
const updateAppointment = async (req, res) => {
  const { status, notes, prescription } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role check: Patient can only cancel
    if (req.user.role === 'patient') {
      if (appointment.patient.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
      }

      if (status && status !== 'cancelled') {
        return res.status(400).json({ success: false, message: 'Patients can only request cancellation' });
      }
      
      appointment.status = 'cancelled';
    } 
    // Doctor check: can update status (confirm, complete, cancel) and notes/prescriptions
    else if (req.user.role === 'doctor') {
      if (appointment.doctor.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
      }

      if (status) appointment.status = status;
      if (notes !== undefined) appointment.notes = notes;
      if (prescription !== undefined) appointment.prescription = prescription;
    }
    // Admin check: can modify anything
    else if (req.user.role === 'admin') {
      if (status) appointment.status = status;
      if (notes !== undefined) appointment.notes = notes;
      if (prescription !== undefined) appointment.prescription = prescription;
    }

    const updatedAppointment = await appointment.save();

    // Populate updated document
    const result = await Appointment.findById(updatedAppointment._id)
      .populate('patient', 'name email phone bloodGroup medicalHistory')
      .populate('doctor', 'name email phone specialization bio');

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete appointment record
// @route   DELETE /api/appointments/:id
// @access  Private (Admin only)
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await appointment.deleteOne();
    res.json({ success: true, message: 'Appointment removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment
};
