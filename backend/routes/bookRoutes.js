const express = require('express');
const { 
    getBooks, 
    addBook, 
    updateBook, 
    deleteBook, 
    searchGoogleBooks 
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getBooks)
    .post(protect, authorize('admin'), addBook);

router.get('/google-search/:isbn', protect, authorize('admin'), searchGoogleBooks);

router.route('/:id')
    .put(protect, authorize('admin'), updateBook)
    .delete(protect, authorize('admin'), deleteBook);

module.exports = router;
