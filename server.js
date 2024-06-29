require('dotenv').config(); // Load environment variables from.env
const express = require('express');
const mysql = require('mysql2/promise'); // MySQL client
const app = express();
const port = process.env.PORT || 3000;

// Database Connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const db = mysql.createPool(dbConfig);

// Middleware (optional)
app.use(express.json()); // Parse JSON request bodies
// app.use(cors()); // Enable CORS if necessary

// API Route to Fetch and Store Data
app.get('/api/crypto-data', async (req, res) => {
  try {
    // Fetch data from WazirX API
    const apiResponse = await fetch('https://api.wazirx.com/api/v2/tickers');
    const apiData = await apiResponse.json();

    // Extract top 10 results
    const top10 = Object.entries(apiData).slice(0, 10);

    // Insert data into the database (example using MySQL)
    for (const [symbol, data] of top10) {
      const { last, buy, sell, volume, base_unit } = data;
      await db.execute(
        'INSERT INTO crypto_data (symbol, last, buy, sell, volume, base_unit) VALUES (?,?,?,?,?,?)',
        [symbol, last, buy, sell, volume, base_unit]
      );
    }

    // Get data from the database
    const [dbData] = await db.execute('SELECT * FROM crypto_data');

    // Send data to the frontend
    res.json(dbData);
  } catch (error) {
    console.error('Error fetching or storing data:', error);
    res.status(500).json({ error: 'Failed to fetch or store data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});