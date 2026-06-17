const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['report', 'prescription'],
    default: 'report',
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
