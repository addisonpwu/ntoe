const { pool } = require('../db');

// Get all tags for the current user
const getAllTags = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query('SELECT * FROM tags WHERE user_id = ? ORDER BY name', [userId]);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/tags Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// This function is now in noteController.js as it modifies a note
// const addTagToNote = ...

// This function is now in noteController.js as it modifies a note
// const removeTagFromNote = ...

module.exports = {
  getAllTags,
  // addTagToNote and removeTagFromNote have been moved to noteController
  // to better handle user ownership verification of the note being modified.
};