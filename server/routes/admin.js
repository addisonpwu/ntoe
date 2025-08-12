const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

// GET /api/admin/notes
router.get('/notes', adminController.getAllNotes);

module.exports = router;
