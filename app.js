const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb+srv://bunnysayzz:Azhar70@cluster0.iggwbjd.mongodb.net/hodlinfo', {
  serverSelectionTimeoutMS: 50000, // Increase timeout to 50 seconds
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Define a schema and model
const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
  difference: Number,
  savings: Number,
  icon: String, // Ensure icon field is included
});

const Ticker = mongoose.model('Ticker', tickerSchema, 'tickers'); // Explicitly specify the collection name

// Middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Fetch data from WazirX API and store in MongoDB
const fetchData = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = response.data;
    const top10Tickers = Object.values(tickers).slice(0, 10);

    // Define a mapping of platform names to icon classes
    const platformIcons = {
      btc: 'fab fa-bitcoin',
      xrp: 'fas fa-coins', // Use a generic icon for XRP
      eth: 'fab fa-ethereum',
      // Add more mappings as needed
    };

    // Calculate the highest and lowest prices for savings calculation
    const highestPrice = Math.max(...top10Tickers.map(ticker => ticker.last));
    const lowestPrice = Math.min(...top10Tickers.map(ticker => ticker.last));

    await Ticker.deleteMany({});
    const result = await Ticker.insertMany(top10Tickers.map(ticker => ({
      name: ticker.name,
      last: ticker.last,
      buy: ticker.buy,
      sell: ticker.sell,
      volume: ticker.volume,
      base_unit: ticker.base_unit,
      difference: ((ticker.last - ticker.buy) / ticker.buy * 100).toFixed(2),
      savings: (ticker.last - lowestPrice).toFixed(2),
      icon: platformIcons[ticker.base_unit] || 'fas fa-coins', // Default icon if not found
    })));

    console.log(`Inserted ${result.length} tickers into the database.`);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Fetch data every 5 minutes
setInterval(fetchData, 5 * 60 * 1000);
fetchData();

// Routes
app.get('/', async (req, res) => {
  const tickers = await Ticker.find({});
  res.render('index', { tickers });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});