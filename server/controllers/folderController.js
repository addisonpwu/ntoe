const { pool } = require('../db');

// Get all folders for the current user
const getAllFolders = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT f.id, f.name, COUNT(n.id) as note_count
      FROM folders f
      LEFT JOIN notes n ON f.id = n.folder_id AND n.archived = FALSE
      WHERE f.user_id = ?
      GROUP BY f.id
      ORDER BY f.name;
    `;
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/folders Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new folder for the current user
const createFolder = async (req, res) => {
  const userId = req.user.id;
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    const [result] = await pool.query('INSERT INTO folders (name, user_id) VALUES (?, ?)', [name, userId]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error('POST /api/folders Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rename a folder for the current user
const renameFolder = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'New folder name is required' });
    }
    await pool.query('UPDATE folders SET name = ? WHERE id = ? AND user_id = ?', [name, id, userId]);
    res.json({ message: 'Folder renamed successfully' });
  } catch (error) {
    console.error(`PUT /api/folders/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a folder for the current user
const deleteFolder = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM folders WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(204).send();
  } catch (error) {
    console.error(`DELETE /api/folders/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllFolders,
  createFolder,
  renameFolder,
  deleteFolder
};