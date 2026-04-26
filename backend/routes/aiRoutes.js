const express = require('express');
const router = express.Router();
const { processChat, summarizeBook } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, processChat);
router.post('/summarize/:bookId', protect, summarizeBook);

module.exports = router;
