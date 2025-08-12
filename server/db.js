const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'notes_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to create and update tables
const setupDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to database. Setting up tables...");

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'users' is ready.");

    // Folders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
    // Add user_id to folders
    const [folderColumns] = await connection.query("SHOW COLUMNS FROM folders LIKE 'user_id'");
    if (folderColumns.length === 0) {
      console.log("Adding 'user_id' to 'folders' table...");
      await connection.query('ALTER TABLE folders ADD COLUMN user_id INT NULL AFTER id');
      await connection.query('ALTER TABLE folders ADD CONSTRAINT fk_user_id_folders FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    }
    console.log("Table 'folders' is ready.");

    // Notes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content JSON NOT NULL,
        type ENUM('normal', 'weekly') DEFAULT 'normal',
        archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    // Add user_id to notes
    const [noteColumns] = await connection.query("SHOW COLUMNS FROM notes LIKE 'user_id'");
    if (noteColumns.length === 0) {
      console.log("Adding 'user_id' to 'notes' table...");
      await connection.query('ALTER TABLE notes ADD COLUMN user_id INT NULL AFTER id');
      await connection.query('ALTER TABLE notes ADD CONSTRAINT fk_user_id_notes FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    }
    // Add folder_id to notes
    const [folderFkColumns] = await connection.query("SHOW COLUMNS FROM notes LIKE 'folder_id'");
    if (folderFkColumns.length === 0) {
      console.log("Adding 'folder_id' column to 'notes' table...");
      await connection.query('ALTER TABLE notes ADD COLUMN folder_id INT NULL AFTER user_id');
      await connection.query('ALTER TABLE notes ADD CONSTRAINT fk_folder_id FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL');
    }
    console.log("Table 'notes' is ready.");

    // Tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
    // Add user_id to tags and manage unique constraint
    const [tagColumns] = await connection.query("SHOW COLUMNS FROM tags LIKE 'user_id'");
    if (tagColumns.length === 0) {
      console.log("Adding 'user_id' to 'tags' table and updating constraints...");
      // Check for and drop the old unique constraint on 'name' if it exists
      const [indexes] = await connection.query("SHOW INDEX FROM tags WHERE Key_name = 'name'");
      if (indexes.length > 0) {
        await connection.query('ALTER TABLE tags DROP INDEX name');
      }
      await connection.query('ALTER TABLE tags ADD COLUMN user_id INT NULL AFTER id');
      await connection.query('ALTER TABLE tags ADD CONSTRAINT fk_user_id_tags FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      await connection.query('ALTER TABLE tags ADD UNIQUE INDEX idx_user_tag_name (user_id, name)');
    }
    console.log("Table 'tags' is ready.");

    // Note_Tags pivot table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS note_tags (
        note_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (note_id, tag_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);
    console.log("Table 'note_tags' is ready.");

  } catch (error) {
    console.error('Error setting up the database:', error);
    // Don't exit process on schema update errors in dev, just log them
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  pool,
  setupDatabase
};