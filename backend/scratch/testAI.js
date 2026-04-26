require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const aiController = require('../controllers/aiController');

async function runTest() {
    await mongoose.connect('mongodb+srv://MohithNaidu:MohithNaidu7806@cluster0.ycxrolh.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0');
    
    // Find any book
    const book = await Book.findOne();
    if (!book) {
        console.log('No books in DB');
        process.exit();
    }

    console.log(`Testing AI on: ${book.title}`);
    
    // Mock req and res
    const req = { params: { bookId: book._id } };
    const res = {
        status: (code) => ({
            json: (data) => {
                console.log('API_RESPONSE_CODE:', code);
                console.log('AI_SUMMARY:', data.summary);
            }
        })
    };

    await aiController.summarizeBook(req, res);
    process.exit();
}

runTest();
