const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/order/:transactionId
exports.createOrder = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        
        let fineToPay = transaction.fine;
        if (transaction.status === 'issued') {
            const now = new Date();
            if (now > transaction.dueDate) {
                const diffTime = Math.abs(now - transaction.dueDate);
                const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                fineToPay = diffMinutes * 10;
            }
        }
        
        if (fineToPay <= 0) return res.status(400).json({ message: 'No fine to pay' });

        const options = {
            amount: fineToPay * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${transaction._id}`
        };

        const order = await razorpay.orders.create(options);

        // Create a pending payment record
        await Payment.create({
            user: req.user.id,
            transaction: transaction._id,
            amount: fineToPay,
            razorpayOrderId: order.id,
            status: 'pending'
        });

        res.status(200).json({ success: true, order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update Payment record
            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { 
                    status: 'completed',
                    razorpayPaymentId: razorpay_payment_id 
                },
                { new: true }
            );

            // Clear the fine in the Transaction record
            await Transaction.findByIdAndUpdate(payment.transaction, { fine: 0 });

            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
