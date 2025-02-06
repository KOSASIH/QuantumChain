// src/tests/integration/service.test.js

const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your Express app
const db = require('../../src/db'); // Adjust the path to your database connection

describe('Service Integration Tests', () => {
    beforeAll(async () => {
        await db.connect(); // Connect to the database
    });

    afterAll(async () => {
        await db.disconnect(); // Disconnect from the database
    });

    test('User service should create a new user', async () => {
        const newUser = { username: 'newuser', password: 'newpassword' };

        const response = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.username).toBe(newUser.username);
    });

    test('User service should retrieve a user by ID', async () => {
        const userId = 1; // Replace with a valid user ID

        const response = await request(app)
            .get(`/api/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', userId);
    });

    test('Data service should return all items', async () => {
        const response = await request(app)
            .get('/api/items');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('items');
        expect(Array.isArray(response.body.items)).toBe(true);
    });

    test('Notification service should send a notification', async () => {
        const notification = { message: 'Test notification', recipient: 'user@example.com' };

        const response = await request(app)
            .post('/api/notifications')
            .send(notification);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'sent');
    });
});
