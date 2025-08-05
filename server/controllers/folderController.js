const { pool } = require('../db');

// Get all folders
const getAllFolders = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM folders ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('GET /api/folders Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new folder
const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    const [result] = await pool.query('INSERT INTO folders (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error('POST /api/folders Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rename a folder
const renameFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'New folder name is required' });
    }
    await pool.query('UPDATE folders SET name = ? WHERE id = ?', [name, id]);
    res.json({ message: 'Folder renamed successfully' });
  } catch (error) {
    console.error(`PUT /api/folders/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a folder
const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    // The ON DELETE SET NULL constraint will handle moving notes to inbox
    await pool.query('DELETE FROM folders WHERE id = ?', [id]);
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