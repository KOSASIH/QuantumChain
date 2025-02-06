// services/dataService.js

const { MongoClient } = require('mongodb');
const winston = require('winston');
require('dotenv').config();

const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'dataService.log' })
    ],
});

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoClient.connect();
        db = mongoClient.db(process.env.DB_NAME);
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error("MongoDB connection error:", error);
    }
}

// Data Validation
const validateData = (data) => {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
    }
    // Add more validation rules as needed
};

// Create a new record
async function createRecord(collectionName, data) {
    validateData(data);
    try {
        const result = await db.collection(collectionName).insertOne(data);
        logger.info(`Record created in ${collectionName}: ${result.insertedId}`);
        return result.insertedId;
    } catch (error) {
        logger.error("Error creating record:", error);
        throw error;
    }
}

// Read records
async function readRecords(collectionName, query = {}) {
    try {
        const records = await db.collection(collectionName).find(query).toArray();
        logger.info(`Records retrieved from ${collectionName}: ${records.length}`);
        return records;
    } catch (error) {
        logger.error("Error reading records:", error);
        throw error;
    }
}

// Update a record
async function updateRecord(collectionName, id, updateData) {
    validateData(updateData);
    try {
        const result = await db.collection(collectionName).updateOne({ _id: id }, { $set: updateData });
        if (result.modifiedCount === 0) {
            logger.warn(`No records updated in ${collectionName} for ID: ${id}`);
        } else {
            logger.info(`Record updated in ${collectionName} for ID: ${id}`);
        }
        return result.modifiedCount;
    } catch (error) {
        logger.error("Error updating record:", error);
        throw error;
    }
}

// Delete a record
async function deleteRecord(collectionName, id) {
    try {
        const result = await db.collection(collectionName).deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            logger.warn(`No records deleted in ${collectionName} for ID: ${id}`);
        } else {
            logger.info(`Record deleted from ${collectionName} for ID: ${id}`);
        }
        return result.deletedCount;
    } catch (error) {
        logger.error("Error deleting record:", error);
        throw error;
    }
}

// Start the service
connectDB();

module.exports = {
    createRecord,
    readRecords,
    updateRecord,
    deleteRecord,
};
