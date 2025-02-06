// utils/encryption.js

const crypto = require('crypto');

// Define the algorithm and key size
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Initialization vector length for AES

/**
 * Generate a random initialization vector.
 * @returns {Buffer} - The generated IV.
 */
function generateIV() {
    return crypto.randomBytes(IV_LENGTH);
}

/**
 * Encrypt data using AES-256-CBC.
 * @param {string} text - The plaintext to encrypt.
 * @param {string} key - The encryption key (must be 32 bytes for AES-256).
 * @returns {string} - The encrypted data in base64 format.
 */
function encrypt(text, key) {
    const iv = generateIV();
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    // Return the IV and encrypted data concatenated
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt data using AES-256-CBC.
 * @param {string} encryptedData - The encrypted data in base64 format.
 * @param {string} key - The decryption key (must be 32 bytes for AES-256).
 * @returns {string} - The decrypted plaintext.
 */
function decrypt(encryptedData, key) {
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt,
};
