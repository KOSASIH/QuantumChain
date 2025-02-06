// utils/cache.js

const NodeCache = require('node-cache');

// Create a new cache instance with a default TTL of 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// Function to set a value in the cache
/**
 * Set a value in the cache.
 * @param {string} key - The key under which to store the value.
 * @param {any} value - The value to store in the cache.
 * @param {number} [ttl] - Optional time-to-live in seconds for this cache entry.
 */
function setCache(key, value, ttl) {
    cache.set(key, value, ttl);
}

/**
 * Get a value from the cache.
 * @param {string} key - The key of the value to retrieve.
 * @returns {any|null} - The cached value or null if not found.
 */
function getCache(key) {
    return cache.get(key);
}

/**
 * Delete a value from the cache.
 * @param {string} key - The key of the value to delete.
 * @returns {boolean} - True if the key was found and deleted, false otherwise.
 */
function deleteCache(key) {
    return cache.del(key);
}

/**
 * Flush all cache entries.
 * @returns {void}
 */
function flushCache() {
    cache.flushAll();
}

/**
 * Get the current cache statistics.
 * @returns {object} - An object containing cache statistics.
 */
function getCacheStats() {
    return cache.getStats();
}

module.exports = {
    setCache,
    getCache,
    deleteCache,
    flushCache,
    getCacheStats,
};
