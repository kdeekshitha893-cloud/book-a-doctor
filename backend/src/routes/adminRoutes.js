const express = require('express');
const router = express.Router();
const { getStats, getPendingDoctors, verifyDoctor } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // All routes in this module are admin-restricted

router.get('/stats', getStats);
router.get('/pending-doctors', getPendingDoctors);
router.put('/verify-doctor/:id', verifyDoctor);

module.exports = router;
