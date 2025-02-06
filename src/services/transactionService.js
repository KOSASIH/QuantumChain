// services/transactionService.js

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

// Endpoint to create a transaction
app.post('/transactions', async (req, res) => {
    const { userId, amount, currency, description } = req.body;

    if (!userId || !amount || !currency) {
        return res.status(400).send('Invalid input');
    }

    const transaction = {
        userId,
        amount,
        currency,
        description,
        status: 'pending',
        createdAt: new Date(),
    };

    try {
        const result = await db.collection('transactions').insertOne(transaction);
        
        // Log the transaction creation
        await db.collection('transaction_logs').insertOne({
            transactionId: result.insertedId,
            action: 'create',
            status: 'pending',
            timestamp: new Date(),
        });

        res.status(201).json({ transactionId: result.insertedId });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).send('Error creating transaction');
    }
});

// Endpoint to get transaction status
app.get('/transactions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await db.collection('transactions').findOne({ _id: new MongoClient.ObjectId(id) });
        if (!transaction) {
            return res.status(404).send('Transaction not found');
        }
        res.json(transaction);
    } catch (error) {
        console.error('Error retrieving transaction:', error);
        res.status(500).send('Error retrieving transaction');
    }
});

// Endpoint to update transaction status
app.patch('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).send('Invalid input');
    }

    try {
        const result = await db.collection('transactions').updateOne(
            { _id: new MongoClient.ObjectId(id) },
            { $set: { status } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send('Transaction not found or status unchanged');
        }

        // Log the transaction update
        await db.collection('transaction_logs').insertOne({
            transactionId: id,
            action: 'update',
            status,
            timestamp: new Date(),
        });

        res.send('Transaction status updated successfully');
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).send('Error updating transaction');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Transaction Service is running on port ${PORT}`);
});

// Connect to the database
connectDB();
