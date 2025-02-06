// services/analyticsService.js

const express = require('express');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
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

// Endpoint to track usage events
app.post('/track', async (req, res) => {
    const { userId, eventType, metadata } = req.body;

    if (!userId || !eventType) {
        return res.status(400).send('Invalid input');
    }

    const event = {
        userId,
        eventType,
        metadata,
        timestamp: new Date(),
    };

    try {
        await db.collection('analytics').insertOne(event);
        res.status(201).send('Event tracked successfully');
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).send('Error tracking event');
    }
});

// Endpoint to get aggregated analytics data
app.get('/analytics', async (req, res) => {
    try {
        const aggregation = await db.collection('analytics').aggregate([
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 },
                    users: { $addToSet: '$userId' },
                },
            },
            {
                $project: {
                    eventType: '$_id',
                    count: 1,
                    uniqueUsers: { $size: '$users' },
                    _id: 0,
                },
            },
        ]).toArray();

        res.json(aggregation);
    } catch (error) {
        console.error('Error retrieving analytics data:', error);
        res.status(500).send('Error retrieving analytics data');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Analytics service is running on port ${PORT}`);
});

// Connect to the database
connectDB();
