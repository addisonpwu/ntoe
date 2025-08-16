const { pool } = require('../db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

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
    const [notes] = await pool.query("SELECT * FROM notes WHERE status = 'submitted' ORDER BY updated_at DESC");
    res.json(notes);
  } catch (error) {
    console.error('Error fetching all notes:', error);
    res.status(500).json({ message: 'Failed to fetch all notes' });
  }
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

const aggregateWeeklyNotes = async (req, res) => {
  const { noteIds } = req.body;

  if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    return res.status(400).json({ message: 'An array of noteIds is required.' });
  }

  try {
    const query = `
      SELECT n.content, u.username 
      FROM notes n 
      JOIN users u ON n.user_id = u.id 
      WHERE n.id IN (?) AND n.type = 'weekly' AND n.status = 'submitted'
    `;

    const [notes] = await pool.query(query, [noteIds]);

    if (notes.length === 0) {
      return res.status(404).json({ message: 'No valid, submitted weekly notes found for the given IDs.' });
    }

    const keyFocusMap = new Map();
    const regularWorkMap = new Map();

    const processItem = (map, item, username) => {
      const tags = (item.tags || []).map(t => t.name).sort();
      const key = item.text + JSON.stringify(tags);

      if (!map.has(key)) {
        map.set(key, {
          text: item.text,
          tags: tags,
          submitters: new Set(),
        });
      }
      map.get(key).submitters.add(username);
    };

    for (const note of notes) {
      let content;
      try {
        content = JSON.parse(note.content);
      } catch (e) {
        content = note.content;
      }

      if (typeof content !== 'object' || content === null) {
        continue;
      }
      if (content.keyFocus && Array.isArray(content.keyFocus)) {
        content.keyFocus.forEach(item => processItem(keyFocusMap, item, note.username));
      }
      if (content.regularWork && Array.isArray(content.regularWork)) {
        content.regularWork.forEach(item => processItem(regularWorkMap, item, note.username));
      }
    }

    const aggregated = {
      keyFocus: Array.from(keyFocusMap.values()).map(item => {
        const submitters = Array.from(item.submitters).join(', ');
        const tagString = item.tags.length > 0 ? `[${item.tags.join(', ')}] ` : '';
        return { content: `${tagString}${item.text} (提交人: ${submitters})` };
      }),
      regularWork: Array.from(regularWorkMap.values()).map(item => {
        const submitters = Array.from(item.submitters).join(', ');
        const tagString = item.tags.length > 0 ? `[${item.tags.join(', ')}] ` : '';
        return { content: `${tagString}${item.text} (提交人: ${submitters})` };
      }),
    };

    res.json(aggregated);

  } catch (error) {
    console.error('Error aggregating weekly notes:', error);
    res.status(500).json({ message: 'Failed to aggregate weekly notes' });
  }
};

const downloadReport = async (req, res) => {
  const { aggregatedData, noteIds, startDate, endDate } = req.body;

  if (!aggregatedData) {
    return res.status(400).json({ message: 'Aggregated data is required.' });
  }

  try {
    // Fetch all members who should submit a report
    const [allMembers] = await pool.query("SELECT id, username FROM users WHERE role = 'member'");

    // Fetch users who submitted the selected notes
    let submittedUserIds = [];
    if (noteIds && noteIds.length > 0) {
      const [submittedNotes] = await pool.query("SELECT DISTINCT user_id FROM notes WHERE id IN (?)", [noteIds]);
      submittedUserIds = submittedNotes.map(n => n.user_id);
    }

    // Determine unsubmitted users
    const unsubmittedUsers = allMembers.filter(member => !submittedUserIds.includes(member.id));
    const unsubmitted_list = unsubmittedUsers.map(user => user.username).join('、') || '無';

    const templatePath = path.join(__dirname, '..', 'template', 'template.docx');
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    };

    const dateRange = (startDate && endDate)
      ? `${formatDate(startDate)}-${formatDate(endDate)}`
      : '未指定日期範圍';

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const report_date_formatted = `${year}年${month}月${day}日`;

    doc.render({
      report_date: report_date_formatted,
      date_range: dateRange,
      key_focus: aggregatedData.keyFocus,
      regular_work: aggregatedData.regularWork,
      test: '' /* 測試字段留空 */,
      unsubmitted_list: unsubmitted_list,
    });

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    const fileName = `Weekly_Report_${Date.now()}.docx`;
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);

  } catch (error) {
    console.error('Error generating Word document:', error);
    if (error.properties && error.properties.errors) {
      console.error('Docxtemplater errors:', error.properties.errors);
    }
    res.status(500).json({ message: 'Failed to generate Word document.' });
  }
};

module.exports = {
  getStats,
  getAllNotes,
  listUsers,
  createUser,
  deleteUser,
  aggregateWeeklyNotes,
  downloadReport,
};