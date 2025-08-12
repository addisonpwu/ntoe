const { pool } = require('../db');

const getStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) as totalNotes,
        SUM(CASE WHEN type = 'normal' THEN 1 ELSE 0 END) as normalNotes,
        SUM(CASE WHEN type = 'weekly' THEN 1 ELSE 0 END) as weeklyNotes,
        SUM(CASE WHEN archived = 1 THEN 1 ELSE 0 END) as archivedNotes
       FROM notes`
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const [notes] = await pool.query('SELECT id, title, type, archived, created_at FROM notes ORDER BY created_at DESC');
    res.json(notes);
  } catch (error) {
    console.error('Error fetching all notes:', error);
    res.status(500).json({ message: 'Failed to fetch all notes' });
  }
};

module.exports = {
  getStats,
  getAllNotes,
};

const listUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ message: 'Failed to list users' });
  }
};

const createUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required.' });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );

    res.status(201).json({ id: result.insertId, username, role });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Prevent admin from deleting themselves
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ message: 'Admin cannot delete themselves.' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = {
  getStats,
  getAllNotes,
  listUsers,
  createUser,
  deleteUser,
};
