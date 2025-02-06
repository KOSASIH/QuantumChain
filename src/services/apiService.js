// services/apiService.js

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Web3 = require('web3');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Swagger documentation setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Service',
            version: '1.0.0',
            description: 'API for interacting with smart contracts and managing subscriptions',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./services/apiService.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

// User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Invalid input');
    }

    const existingUser  = await db.collection('users').findOne({ username });
    if (existingUser ) {
        return res.status(400).send('User  already exists');
    }

    const user = { username, password }; // In a real app, hash the password
    await db.collection('users').insertOne(user);
    res.status(201).send('User  registered successfully');
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.collection('users').findOne({ username, password });
    if (!user) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Example Smart Contract Interaction
app.post('/contract-call', authenticateToken, async (req, res) => {
    const { contractAddress, functionName, params } = req.body;

    // Example ABI (replace with actual contract ABI)
    const contractABI = []; // Add your contract's ABI here
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
        const result = await contract.methods[functionName](...params).call();
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error calling contract function');
    }
});

// Subscription Management
app.post('/subscriptions', authenticateToken, async (req, res) => {
    const { amount, duration } = req.body;
    const userId = req.user.username;

    // Validate input
    if (!amount || !duration) {
        return res.status(400).send('Invalid input');
    }

    // Create subscription logic here
    // ...

    res.status(201).send('Subscription created successfully');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Connect to the database
connectDB();
