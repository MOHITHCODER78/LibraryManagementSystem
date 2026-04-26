const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'issued', 'returned', 'rejected'],
        default: 'pending'
    },
    requestedDays: {
        type: Number,
        default: 3,
        min: 1,
        max: 7
    },
    issueDate: {
        type: Date
    },
    dueDate: {
        type: Date
    },
    returnDate: {
        type: Date
    },
    fine: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
