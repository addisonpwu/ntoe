const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const createAdmin = async () => {
  const username = 'admin';
  const password = 'password';
  const role = 'admin';

  try {
    // Check if an admin user already exists
    const [existingAdmins] = await pool.query('SELECT * FROM users WHERE role = ?', [role]);
    if (existingAdmins.length > 0) {
      console.log('An admin user already exists.');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new admin user
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );

    console.log('Admin user created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Failed to create admin user:', error);
  } finally {
    // End the pool connection so the script can exit
    pool.end();
  }
};

createAdmin();
