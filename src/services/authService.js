// services/authService.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

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

// User Registration
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).send('Invalid input');
    }

    const existingUser  = await db.collection('users').findOne({ username });
    if (existingUser ) {
        return res.status(400).send('User  already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword, role: role || 'user' }; // Default role is 'user'
    await db.collection('users').insertOne(user);
    res.status(201).send('User  registered successfully');
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.collection('users').findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware to authorize based on roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).send('Access denied');
        }
        next();
    };
};

// Example protected route
app.get('/protected', authenticateToken, authorizeRoles('admin'), (req, res) => {
    res.send('This is a protected route for admins only');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}`);
});

// Connect to the database
connectDB();
