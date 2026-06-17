const Document = require('../models/Document');
const Appointment = require('../models/Appointment');
const fs = require('fs');
const path = require('path');

// @desc    Upload patient document (report or prescription)
// @route   POST /api/documents/upload
// @access  Private (Patient only)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { name, type } = req.body;

    const document = await Document.create({
      owner: req.user.id,
      name: name || req.file.originalname,
      type: type || 'report',
      fileUrl: `/uploads/${req.file.filename}` // Relational static URL
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get documents
// @route   GET /api/documents
// @access  Private (Patient, Doctor, Admin)
const getDocuments = async (req, res) => {
  const { patientId } = req.query;

  try {
    // 1. Patient gets their own documents
    if (req.user.role === 'patient') {
      const documents = await Document.find({ owner: req.user.id }).sort({ uploadedAt: -1 });
      return res.json({ success: true, count: documents.length, data: documents });
    }

    // 2. Doctor gets patient documents (Requires relationship verification)
    if (req.user.role === 'doctor') {
      if (!patientId) {
        return res.status(400).json({ success: false, message: 'Patient ID query parameter is required for doctors' });
      }

      // Secure Role Check: Verify doctor has an active/completed appointment relationship with this patient
      const appointmentRelation = await Appointment.findOne({
        doctor: req.user.id,
        patient: patientId
      });

      if (!appointmentRelation) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have an appointment relation with this patient.'
        });
      }

      const documents = await Document.find({ owner: patientId }).sort({ uploadedAt: -1 });
      return res.json({ success: true, count: documents.length, data: documents });
    }

    // 3. Admin gets documents
    if (req.user.role === 'admin') {
      const query = patientId ? { owner: patientId } : {};
      const documents = await Document.find(query).sort({ uploadedAt: -1 });
      return res.json({ success: true, count: documents.length, data: documents });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (Patient only)
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check ownership
    if (document.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    // Delete actual file in uploads folder
    const filename = path.basename(document.fileUrl);
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();

    res.json({ success: true, message: 'Document removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument
};
