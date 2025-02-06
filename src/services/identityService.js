// services/identityService.js

const express = require('express');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const IPFS = require('ipfs-http-client');
const Web3 = require('web3');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('combined'));

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

// IPFS setup
const ipfs = IPFS.create({ url: process.env.IPFS_URL });

// Web3 setup
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

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

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Create a decentralized identity
app.post('/identity', authenticateToken, async (req, res) => {
    const { name, email, publicKey } = req.body;

    if (!name || !email || !publicKey) {
        return res.status(400).send('Invalid input');
    }

    // Store identity data on IPFS
    const identityData = { name, email, publicKey };
    const { path } = await ipfs.add(JSON.stringify(identityData));

    // Store the IPFS hash and user info in MongoDB
    const identity = {
        userId: req.user.id,
        ipfsHash: path,
        createdAt: new Date(),
    };

    await db.collection('identities').insertOne(identity);
    res.status(201).send('Identity created successfully');
});

// Verify identity using smart contract
app.post('/verify-identity', authenticateToken, async (req, res) => {
    const { publicKey } = req.body;

    if (!publicKey) {
        return res.status(400).send('Invalid input');
    }

    // Here you would interact with a smart contract to verify the identity
    // For example, you could check if the publicKey is associated with a verified identity

    // Placeholder for smart contract verification logic
    const isVerified = true; // Replace with actual verification logic

    if (isVerified) {
        res.send('Identity verified successfully');
    } else {
        res.status(403).send('Identity verification failed');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Identity service is running on port ${PORT}`);
});

// Connect to the database
connectDB();
