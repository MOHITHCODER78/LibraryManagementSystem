const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/order/:transactionId', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
