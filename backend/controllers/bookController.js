const Book = require('../models/Book');
const axios = require('axios');

// @desc    Get all books with search and filters
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        const books = await Book.find(query);
        res.status(200).json({ success: true, count: books.length, data: books });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add a new book
// @route   POST /api/books
// @access  Private/Admin
exports.addBook = async (req, res) => {
    try {
        const { isbn } = req.body;

        // Check if book already exists
        const existingBook = await Book.findOne({ isbn });
        if (existingBook) {
            return res.status(400).json({ success: false, message: 'Book with this ISBN already exists' });
        }

        const book = await Book.create(req.body);
        res.status(201).json({ success: true, data: book });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: book });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        await book.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Search Global Books API (Google + Open Library fallback)
// @route   GET /api/books/google-search/:isbn
// @access  Private/Admin
exports.searchGoogleBooks = async (req, res) => {
    try {
        const { isbn } = req.params;
        let formattedBook = null;

        // Try Google Books First
        try {
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            if (response.data.items && response.data.items.length > 0) {
                const bookInfo = response.data.items[0].volumeInfo;
                formattedBook = {
                    title: bookInfo.title,
                    author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown',
                    isbn: isbn,
                    category: bookInfo.categories ? bookInfo.categories[0] : 'Technology',
                    description: bookInfo.description || '',
                    thumbnail: bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
                    googleBookId: response.data.items[0].id
                };
            }
        } catch (gErr) {
            console.log('Google Books API rate limit hit, trying Open Library...');
        }

        // Fallback to Open Library if Google Failed or returned nothing
        if (!formattedBook) {
            try {
                const olRes = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
                const data = olRes.data[`ISBN:${isbn}`];
                
                if (data) {
                    formattedBook = {
                        title: data.title,
                        author: data.authors ? data.authors.map(a => a.name).join(', ') : 'Unknown',
                        isbn: isbn,
                        category: 'Technology', // Default category
                        description: data.notes || 'Description not available from Open Library.',
                        thumbnail: data.cover?.medium || `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
                        googleBookId: ''
                    };
                }
            } catch (olErr) {
                console.log('Open Library fallback failed');
            }
        }

        if (formattedBook) {
            res.status(200).json({ success: true, data: formattedBook });
        } else {
            res.status(404).json({ success: false, message: 'No book found in global databases' });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching book details' });
    }
};
