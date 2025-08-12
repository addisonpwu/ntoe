const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect all routes in this file
// User must be logged in (authMiddleware) and be an admin (adminMiddleware)
router.use(authMiddleware);
router.use(adminMiddleware);

// --- Dashboard --- //
// GET /api/admin/stats
router.get('/stats', adminController.getStats);

// GET /api/admin/notes
router.get('/notes', adminController.getAllNotes);


// --- User Management --- //
// GET /api/admin/users
router.get('/users', adminController.listUsers);

// POST /api/admin/users
router.post('/users', adminController.createUser);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

// --- Aggregation --- //
router.post('/aggregate', adminController.aggregateWeeklyNotes);


module.exports = router;