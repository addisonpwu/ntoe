const { pool } = require('../db');

// Get all notes for the current user
const getAllNotes = async (req, res) => {
  const userId = req.user.id;
  try {
    const status = req.query.status === 'archived' ? true : false;
    const searchTerm = req.query.search || '';
    const tagId = req.query.tagId || null;
    const folderId = req.query.folderId || null;

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

    let whereClauses = ['n.archived = ?', 'n.user_id = ?'];
    params.push(status, userId);

    if (folderId === 'inbox') {
      whereClauses.push('n.folder_id IS NULL');
    } else if (folderId) {
      whereClauses.push('n.folder_id = ?');
      params.push(folderId);
    }

    if (searchTerm) {
      whereClauses.push('(n.title LIKE ? OR n.content LIKE ?)');
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (tagId) {
      whereClauses.push('EXISTS (SELECT 1 FROM note_tags nt2 WHERE nt2.note_id = n.id AND nt2.tag_id = ?)');
      params.push(tagId);
    }

    query += ` WHERE ${whereClauses.join(' AND ')}`;
    query += ' GROUP BY n.id ORDER BY n.updated_at DESC';

    const [rows] = await pool.query(query, params);

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

// Create a new note for the current user
const createNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { title, content, type, folderId } = req.body;
    const contentJSON = JSON.stringify(content);
    const [result] = await pool.query('INSERT INTO notes (title, content, type, folder_id, user_id) VALUES (?, ?, ?, ?, ?)', [title, contentJSON, type, folderId, userId]);
    const [[newNote]] = await pool.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [result.insertId, userId]);
    res.status(201).json({ ...newNote, tags: [] });
  } catch (error) {
    console.error('POST /api/notes Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a note for the current user
const updateNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const contentJSON = JSON.stringify(content);
    await pool.query('UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?', [title, contentJSON, id, userId]);
    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error(`PUT /api/notes/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Move a note to a folder for the current user
const moveNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const { folderId } = req.body;
    await pool.query('UPDATE notes SET folder_id = ? WHERE id = ? AND user_id = ?', [folderId, id, userId]);
    res.json({ message: 'Note moved successfully' });
  } catch (error) {
    console.error(`PUT /api/notes/${id}/move Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a note for the current user
const deleteNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(204).send();
  } catch (error) {
    console.error(`DELETE /api/notes/${id} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Archive a note for the current user
const archiveNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    await pool.query('UPDATE notes SET archived = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Note archived successfully' });
  } catch (error) {
    console.error(`POST /api/notes/${id}/archive Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Unarchive a note for the current user
const unarchiveNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    await pool.query('UPDATE notes SET archived = FALSE WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Note unarchived successfully' });
  } catch (error) {
    console.error(`POST /api/notes/${id}/unarchive Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Add a tag to a note for the current user
const addTagToNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { noteId } = req.params;
    const { tagName } = req.body;

    // Verify the user owns the note
    const [[note]] = await pool.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
    if (!note) {
      return res.status(404).json({ message: 'Note not found or user does not have permission.' });
    }

    // Find tag for the user or create it if it doesn't exist
    let [tags] = await pool.query('SELECT * FROM tags WHERE name = ? AND user_id = ?', [tagName, userId]);
    let tag;
    if (tags.length === 0) {
      const [result] = await pool.query('INSERT INTO tags (name, user_id) VALUES (?, ?)', [tagName, userId]);
      tag = { id: result.insertId, name: tagName };
    } else {
      tag = tags[0];
    }

    // Add the relationship to the pivot table
    await pool.query('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)', [noteId, tag.id]);

    res.status(201).json({ message: 'Tag added successfully', tag });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(200).json({ message: 'Tag already associated with the note.' });
    }
    console.error(`POST /api/notes/${req.params.noteId}/tags Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Remove a tag from a note for the current user
const removeTagFromNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { noteId, tagId } = req.params;

    // Verify the user owns the note before removing the tag
    const [[note]] = await pool.query('SELECT id FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
    if (!note) {
      return res.status(404).json({ message: 'Note not found or user does not have permission.' });
    }

    await pool.query('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?', [noteId, tagId]);
    res.status(204).send();
  } catch (error) {
    console.error(`DELETE /api/notes/${req.params.noteId}/tags/${req.params.tagId} Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Submit a weekly note
const submitNote = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    // Make sure user can only submit their own weekly notes that are currently drafts.
    const [result] = await pool.query(
      "UPDATE notes SET status = 'submitted' WHERE id = ? AND user_id = ? AND type = 'weekly' AND status = 'draft'", 
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Weekly note not found, not a draft, or permission denied.' });
    }

    res.json({ message: 'Weekly note submitted successfully' });
  } catch (error) {
    console.error(`POST /api/notes/${id}/submit Error:`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  moveNote,
  deleteNote,
  archiveNote,
  unarchiveNote,
  addTagToNote,
  removeTagFromNote,
  submitNote
};