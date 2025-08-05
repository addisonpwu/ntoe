const express = require('express');
const cors = require('cors');
const { setupDatabase } = require('./db');
const noteRoutes = require('./routes/notes');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/notes', noteRoutes);

// API endpoint to check database connection
app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('./db');
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', db: 'Connected' });
  } catch (error) {
    console.error('GET /api/health Error:', error);
    res.status(500).json({ status: 'Error', db: 'Not Connected', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server after ensuring DB is ready
const startServer = async () => {
  let retries = 5;
  while (retries) {
    try {
      await setupDatabase();
      app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
      });
      break; // Exit loop if successful
    } catch (err) {
      console.error('Failed to connect to database. Retrying...', retries, 'left');
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
    }
  }
};

startServer();