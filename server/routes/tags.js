const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all tag routes
router.use(authMiddleware);

// Get all tags for the logged-in user
router.get('/', tagController.getAllTags);

// Note: Routes for adding/removing tags from notes are now in routes/notes.js

module.exports = router;
