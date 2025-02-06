// config.js

require('dotenv').config(); // Load environment variables from .env file

const config = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI,
    DB_NAME: process.env.DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    IPFS_URL: process.env.IPFS_URL,
    INFURA_URL: process.env.INFURA_URL,
    EXTERNAL_COMPLIANCE_API_URL: process.env.EXTERNAL_COMPLIANCE_API_URL,
};

module.exports = config;
