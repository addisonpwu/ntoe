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

// Function to create table if it doesn't exist
const setupDatabase = async () => {
  try {
    const connection = await pool.getConnection();
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
    connection.release();
    console.log("Database table 'notes' is ready.");
  } catch (error) {
    console.error('Error setting up the database:', error);
    process.exit(1); // Exit if DB setup fails
  }
};

module.exports = {
  pool,
  setupDatabase
};