const { pool } = require('../db');

// Get all notes
const getAllNotes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notes WHERE archived = FALSE ORDER BY updated_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('GET /api/notes Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const contentJSON = JSON.stringify(content);
    const [result] = await pool.query('INSERT INTO notes (title, content, type) VALUES (?, ?, ?)', [title, contentJSON, type]);
    const [[newNote]] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('POST /api/notes Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const contentJSON = JSON.stringify(content);
    await pool.query('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, contentJSON, id]);
    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error(`PUT /api/notes/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notes WHERE id = ?', [id]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error(`DELETE /api/notes/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote
};