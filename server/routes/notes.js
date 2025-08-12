const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all note routes
router.use(authMiddleware);

// Core Note Routes
router.get('/', noteController.getAllNotes);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

// Note Actions
router.post('/:id/archive', noteController.archiveNote);
router.post('/:id/unarchive', noteController.unarchiveNote);
router.put('/:id/move', noteController.moveNote);

// Tag management for a specific note
router.post('/:noteId/tags', noteController.addTagToNote);
router.delete('/:noteId/tags/:tagId', noteController.removeTagFromNote);

// Submit a weekly note
router.post('/:id/submit', noteController.submitNote);

module.exports = router;
