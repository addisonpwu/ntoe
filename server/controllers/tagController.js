const { pool } = require('../db');

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tags ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('GET /api/tags Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a tag to a note
const addTagToNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { tagName } = req.body;

    // Find tag or create it if it doesn't exist
    let [tag] = await pool.query('SELECT * FROM tags WHERE name = ?', [tagName]);
    if (tag.length === 0) {
      const [result] = await pool.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
      tag = [{ id: result.insertId, name: tagName }];
    }

    const tagId = tag[0].id;

    // Add the relationship to the pivot table
    await pool.query('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)', [noteId, tagId]);

    res.status(201).json({ message: 'Tag added successfully', tag: tag[0] });
  } catch (error) {
    // Ignore duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(200).json({ message: 'Tag already associated with the note.' });
    }
    console.error(`POST /api/notes/${noteId}/tags Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Remove a tag from a note
const removeTagFromNote = async (req, res) => {
  try {
    const { noteId, tagId } = req.params;
    await pool.query('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?', [noteId, tagId]);
    res.status(204).send();
  } catch (error) {
    console.error(`DELETE /api/notes/${noteId}/tags/${tagId} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTags,
  addTagToNote,
  removeTagFromNote
};