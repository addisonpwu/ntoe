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

// Function to create tables if they don't exist
const setupDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to database. Setting up tables...");

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
    console.log("Table 'notes' is ready.");

    // Tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);
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
    process.exit(1); // Exit if DB setup fails
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  pool,
  setupDatabase
};