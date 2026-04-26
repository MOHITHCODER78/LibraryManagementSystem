const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const { cloudinary, storage } = require('../config/cloudinary');

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

// @desc    Upload PDF to Cloudinary
// @route   POST /api/upload/pdf
router.post('/pdf', protect, authorize('admin'), upload.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    // Cloudinary returns the full public URL directly in req.file.path
    res.status(200).json({
        success: true,
        url: req.file.path   // this is the full https://res.cloudinary.com/... URL
    });
});

// @desc    Delete a PDF from Cloudinary (optional cleanup)
// @route   DELETE /api/upload/pdf
router.delete('/pdf', protect, authorize('admin'), async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) return res.status(400).json({ message: 'Public ID required' });
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        res.status(200).json({ success: true, message: 'File deleted from Cloudinary' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
