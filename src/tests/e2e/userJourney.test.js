// src/tests/e2e/userJourney.test.js

const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your Express app

describe('User  Journey Tests', () => {
    let token;

    beforeAll(async () => {
        // Assuming you have a way to get a token for authentication
        const response = await request(app)
            .post('/api/auth/login') // Adjust the endpoint as necessary
            .send({ username: 'testuser', password: 'testpassword' });
        token = response.body.token; // Store the token for authenticated requests
    });

    test('User  can register, login, and create an item', async () => {
        // User registration
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({ username: 'newuser', password: 'newpassword' });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body).toHaveProperty('id');

        // User login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ username: 'newuser', password: 'newpassword' });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty('token');

        // Create an item
        const newItem = { name: 'New Item', price: 100 };
        const createItemResponse = await request(app)
            .post('/api/items')
            .set('Authorization', `Bearer ${loginResponse.body.token}`)
            .send(newItem);

        expect(createItemResponse.status).toBe(201);
        expect(createItemResponse.body).toHaveProperty('id');
        expect(createItemResponse.body.name).toBe(newItem.name);
    });
});
