// services/complianceService.js

const express = require('express');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');
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

// KYC Submission
app.post('/kyc', async (req, res) => {
    const { userId, name, address, idNumber } = req.body;

    if (!userId || !name || !address || !idNumber) {
        return res.status(400).send('Invalid input');
    }

    const kycData = {
        userId,
        name,
        address,
        idNumber,
        status: 'pending',
        createdAt: new Date(),
    };

    try {
        await db.collection('kyc').insertOne(kycData);
        res.status(201).send('KYC submitted successfully');
    } catch (error) {
        console.error('Error submitting KYC:', error);
        res.status(500).send('Error submitting KYC');
    }
});

// AML Check
app.post('/aml-check', async (req, res) => {
    const { transactionId, amount, userId } = req.body;

    if (!transactionId || !amount || !userId) {
        return res.status(400).send('Invalid input');
    }

    // Placeholder for AML check logic
    const isSuspicious = await performAMLCheck(userId, amount);

    if (isSuspicious) {
        return res.status(403).send('Transaction flagged for review');
    }

    // Log the transaction as compliant
    try {
        await db.collection('transactions').insertOne({
            transactionId,
            userId,
            amount,
            status: 'compliant',
            createdAt: new Date(),
        });
        res.status(200).send('Transaction is compliant');
    } catch (error) {
        console.error('Error logging transaction:', error);
        res.status(500).send('Error logging transaction');
    }
});

// Perform AML Check (Placeholder function)
async function performAMLCheck(userId, amount) {
    // Here you would implement your AML logic, possibly integrating with an external API
    // For example, you could check against a list of flagged users or transactions

    // Placeholder logic: flag transactions over a certain amount
    if (amount > 10000) {
        return true; // Flag as suspicious
    }
    return false; // Not suspicious
}

// Example of integrating with an external compliance API
app.post('/external-compliance-check', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).send('Invalid input');
    }

    try {
        const response = await axios.get(`${process.env.EXTERNAL_COMPLIANCE_API_URL}?userId=${userId}`);
        if (response.data.isCompliant) {
            res.status(200).send('User  is compliant');
        } else {
            res.status(403).send('User  is not compliant');
        }
    } catch (error) {
        console.error('Error checking external compliance:', error);
        res.status(500).send('Error checking external compliance');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Compliance service is running on port ${PORT}`);
});

// Connect to the database
connectDB();
