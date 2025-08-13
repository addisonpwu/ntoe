const { pool } = require('../db');

// Get all tags (global)
const getAllTags = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tags ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('GET /api/tags Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new tag (Admin only)
const createTag = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tag name is required.' });
  }
  try {
    const [result] = await pool.query('INSERT INTO tags (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error('POST /api/tags Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a tag (Admin only)
const updateTag = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tag name is required.' });
  }
  try {
    const [result] = await pool.query('UPDATE tags SET name = ? WHERE id = ?', [name, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tag not found.' });
    }
    res.json({ id: Number(id), name });
  } catch (error) {
    console.error(`PUT /api/tags/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a tag (Admin only)
const deleteTag = async (req, res) => {
  const { id } = req.params;
  try {
    // Also need to remove associations from the note_tags table
    await pool.query('DELETE FROM note_tags WHERE tag_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM tags WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tag not found.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(`DELETE /api/tags/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
};
