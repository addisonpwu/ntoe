const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const tagController = require('../controllers/tagController');

// Note Routes
router.get('/', noteController.getAllNotes);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.put('/:id/move', noteController.moveNote);
router.delete('/:id', noteController.deleteNote);
router.post('/:id/archive', noteController.archiveNote);
router.post('/:id/unarchive', noteController.unarchiveNote);

// Tag routes nested under notes
router.post('/:noteId/tags', tagController.addTagToNote);
router.delete('/:noteId/tags/:tagId', tagController.removeTagFromNote);

module.exports = router;