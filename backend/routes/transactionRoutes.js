const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

// Student Routes
router.post('/request', protect, transactionController.requestBook);
router.get('/my', protect, transactionController.getMyTransactions);

// Admin Routes
router.get('/analytics', protect, authorize('admin'), transactionController.getAnalytics);
router.get('/', protect, authorize('admin'), transactionController.getAllTransactions);

// Standardized Admin Actions
router.put('/:id/issue', protect, authorize('admin'), transactionController.issueBook);
router.put('/:id/reject', protect, authorize('admin'), transactionController.rejectBook);
router.put('/:id/return', protect, authorize('admin'), transactionController.returnBook);

module.exports = router;
