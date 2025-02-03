// src/core/configuration/config.js

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from a .env file
dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });

const config = {
    app: {
        port: process.env.PORT || 3000, // Application port
        env: process.env.NODE_ENV || 'development', // Application environment
    },
    database: {
        host: process.env.DB_HOST || 'localhost', // Database host
        port: process.env.DB_PORT || 5432, // Database port
        user: process.env.DB_USER || 'user', // Database user
        password: process.env.DB_PASSWORD || 'password', // Database password
        name: process.env.DB_NAME || 'quantumchain', // Database name
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info', // Logging level
    },
    // Add more configuration settings as needed
};

module.exports = config;
