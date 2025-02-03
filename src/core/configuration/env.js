// src/core/configuration/env.js

const config = {
    development: {
        database: {
            host: 'localhost',
            port: 5432,
            user: 'dev_user',
            password: 'dev_password',
            name: 'quantumchain_dev',
        },
        logging: {
            level: 'debug', // More verbose logging in development
        },
    },
    production: {
        database: {
            host: 'prod-db-host',
            port: 5432,
            user: 'prod_user',
            password: 'prod_password',
            name: 'quantumchain_prod',
        },
        logging: {
            level: 'error', // Less verbose logging in production
        },
    },
    // Add more environments as needed
};

// Export the configuration based on the current environment
const currentEnv = process.env.NODE_ENV || 'development';
module.exports = config[currentEnv];
