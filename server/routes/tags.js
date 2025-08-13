const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect all tag routes
router.use(authMiddleware);

// Get all tags (for all users)
router.get('/', tagController.getAllTags);

// Create a new tag (Admin only)
router.post('/', adminMiddleware, tagController.createTag);

// Update a tag (Admin only)
router.put('/:id', adminMiddleware, tagController.updateTag);

// Delete a tag (Admin only)
router.delete('/:id', adminMiddleware, tagController.deleteTag);

module.exports = router;