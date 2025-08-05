const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Routes for /api/tags
router.get('/', tagController.getAllTags);

module.exports = router;