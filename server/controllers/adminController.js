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
