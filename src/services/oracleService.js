// services/oracleService.js

const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Middleware
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Fetch price data from an external API
async function fetchPriceData(symbol) {
    const url = `${process.env.PRICE_FEED_API_URL}?symbol=${symbol}`;
    const response = await axios.get(url);
    return response.data;
}

// Get price data endpoint
app.get('/price/:symbol', async (req, res) => {
    const { symbol } = req.params;

    // Check cache first
    const cachedData = cache.get(symbol);
    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const priceData = await fetchPriceData(symbol);
        
        // Validate the data
        if (!priceData || !priceData.price) {
            return res.status(500).send('Invalid data received from the price feed');
        }

        // Cache the data
        cache.set(symbol, priceData);

        res.json(priceData);
    } catch (error) {
        console.error('Error fetching price data:', error);
        res.status(500).send('Error fetching price data');
    }
});

// Example of another data feed (e.g., weather data)
async function fetchWeatherData(city) {
    const url = `${process.env.WEATHER_API_URL}?q=${city}&appid=${process.env.WEATHER_API_KEY}`;
    const response = await axios.get(url);
    return response.data;
}

// Get weather data endpoint
app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;

    try {
        const weatherData = await fetchWeatherData(city);
        
        // Validate the data
        if (!weatherData || !weatherData.main) {
            return res.status(500).send('Invalid data received from the weather API');
        }

        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error fetching weather data');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Oracle service is running on port ${PORT}`);
});
