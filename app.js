const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb+srv://bunnysayzz:Azhar70@cluster0.iggwbjd.mongodb.net/', {
  serverSelectionTimeoutMS: 50000, // Increase timeout to 50 seconds
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
});

const Ticker = mongoose.model('Ticker', tickerSchema);

// Middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Fetch data from WazirX API and store in MongoDB
const fetchData = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = response.data;
    const top10Tickers = Object.values(tickers).slice(0, 10);

    // Calculate the highest and lowest prices for savings calculation
    const highestPrice = Math.max(...top10Tickers.map(ticker => ticker.last));
    const lowestPrice = Math.min(...top10Tickers.map(ticker => ticker.last));

    await Ticker.deleteMany({});
    await Ticker.insertMany(top10Tickers.map(ticker => ({
      name: ticker.name,
      last: ticker.last,
      buy: ticker.buy,
      sell: ticker.sell,
      volume: ticker.volume,
      base_unit: ticker.base_unit,
      difference: ((ticker.last - ticker.buy) / ticker.buy * 100).toFixed(2),
      savings: (ticker.last - lowestPrice).toFixed(2),
    })));
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