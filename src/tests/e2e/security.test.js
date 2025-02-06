// src/tests/e2e/security.test.js

const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your Express app

describe('Security Tests', () => {
    test('should prevent SQL injection', async () => {
        const maliciousInput = "'; DROP TABLE users; --";
        const response = await request(app)
            .post('/api/auth/login')
            .send({ username: maliciousInput, password: 'testpassword' });

        expect(response.status).toBe(400); // Expect a bad request or similar response
    });

    test('should prevent XSS attacks', async () => {
        const maliciousInput = '<script>alert("XSS")</script>';
        const response = await request(app)
            .post('/api/items')
            .set('Authorization', `Bearer valid_token`) // Use a valid token
            .send({ name: maliciousInput, price: 100 });

        expect(response.status).toBe(201); // Item should be created without executing the script
        expect(response.body.name).not.toContain('<script>'); // Ensure the script is not present
    });
});
