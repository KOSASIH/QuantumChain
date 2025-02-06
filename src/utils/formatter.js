// utils/formatter.js

/**
 * Format a date to a readable string.
 * @param {Date} date - The date to format.
 * @param {string} format - The desired format (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY').
 * @returns {string} - The formatted date string.
 */
function formatDate(date, format) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    
    if (format === 'YYYY-MM-DD') {
        return formattedDate.split('/').reverse().join('-');
    } else if (format === 'MM/DD/YYYY') {
        return formattedDate;
    }
    
    return formattedDate; // Default format
}

/**
 * Format a number to a currency string.
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR').
 * @returns {string} - The formatted currency string.
 */
function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

/**
 * Format a phone number to a standard format.
 * @param {string} phone - The phone number to format.
 * @returns {string} - The formatted phone number.
 */
function formatPhoneNumber(phone) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone; // Return original if format is not matched
}

/**
 * Format an array of objects into a CSV string.
 * @param {Array} data - The array of objects to format.
 * @returns {string} - The formatted CSV string.
 */
function formatToCSV(data) {
    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    return headers + rows;
}

/**
 * Format a string to title case.
 * @param {string} str - The string to format.
 * @returns {string} - The formatted title case string.
 */
function toTitleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

module.exports = {
    formatDate,
    formatCurrency,
    formatPhoneNumber,
    formatToCSV,
    toTitleCase,
};
