const { pool } = require('../db');

// Get all notes with their tags
const getAllNotes = async (req, res) => {
  try {
    const status = req.query.status === 'archived' ? true : false;
    const searchTerm = req.query.search || '';
    const tagId = req.query.tagId || null;

    let query = `
      SELECT 
        n.*, 
        GROUP_CONCAT(t.id SEPARATOR ',') as tag_ids,
        GROUP_CONCAT(t.name SEPARATOR ',') as tag_names
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
    `;
    const params = [];

    let whereClauses = ['n.archived = ?'];
    params.push(status);

    if (searchTerm) {
      whereClauses.push('(n.title LIKE ? OR n.content LIKE ?)');
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (tagId) {
      // This subquery ensures we only get notes that have the specified tag.
      whereClauses.push('EXISTS (SELECT 1 FROM note_tags nt2 WHERE nt2.note_id = n.id AND nt2.tag_id = ?)');
      params.push(tagId);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ' GROUP BY n.id ORDER BY n.updated_at DESC';

    const [rows] = await pool.query(query, params);

    // Process rows to format tags
    const notes = rows.map(note => ({
      ...note,
      tags: note.tag_ids ? note.tag_ids.split(',').map((id, index) => ({
        id: parseInt(id),
        name: note.tag_names.split(',')[index]
      })) : []
    }));

    res.json(notes);
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
    res.status(201).json({ ...newNote, tags: [] });
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

// Archive a note
const archiveNote = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notes SET archived = TRUE WHERE id = ?', [id]);
    res.json({ message: 'Note archived successfully' });
  } catch (error) {
    console.error(`POST /api/notes/${id}/archive Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Unarchive a note
const unarchiveNote = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notes SET archived = FALSE WHERE id = ?', [id]);
    res.json({ message: 'Note unarchived successfully' });
  } catch (error) {
    console.error(`POST /api/notes/${id}/unarchive Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  archiveNote,
  unarchiveNote
};