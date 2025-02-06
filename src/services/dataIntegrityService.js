// services/dataIntegrityService.js

const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('combined'));

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoClient.connect();
        db = mongoClient.db(process.env.DB_NAME);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Function to generate a checksum for data
function generateChecksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Endpoint to validate data
app.post('/validate', async (req, res) => {
    const { data, expectedChecksum } = req.body;

    if (!data || !expectedChecksum) {
        return res.status(400).send('Invalid input');
    }

    const checksum = generateChecksum(data);

    // Log the validation attempt
    await db.collection('integrity_logs').insertOne({
        data,
        expectedChecksum,
        actualChecksum: checksum,
        timestamp: new Date(),
    });

    if (checksum === expectedChecksum) {
        res.status(200).send('Data is valid');
    } else {
        res.status(400).send('Data integrity check failed');
    }
});

// Endpoint to store data with integrity check
app.post('/store', async (req, res) => {
    const { data } = req.body;

    if (!data) {
        return res.status(400).send('Invalid input');
    }

    const checksum = generateChecksum(data);

    try {
        await db.collection('data_records').insertOne({
            data,
            checksum,
            createdAt: new Date(),
        });

        // Log the storage action
        await db.collection('integrity_logs').insertOne({
            action: 'store',
            data,
            checksum,
            timestamp: new Date(),
        });

        res.status(201).send('Data stored successfully');
    } catch (error) {
        console.error('Error storing data:', error);
        res.status(500).send('Error storing data');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Data Integrity Service is running on port ${PORT}`);
});

// Connect to the database
connectDB();
