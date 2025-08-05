const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');

router.get('/', folderController.getAllFolders);
router.post('/', folderController.createFolder);
router.put('/:id', folderController.renameFolder);
router.delete('/:id', folderController.deleteFolder);

module.exports = router;