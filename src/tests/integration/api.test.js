// src/tests/integration/api.test.js

const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your Express app

describe('API Endpoints', () => {
    let token;

    beforeAll(async () => {
        // Assuming you have a way to get a token for authentication
        const response = await request(app)
            .post('/api/auth/login') // Adjust the endpoint as necessary
            .send({ username: 'testuser', password: 'testpassword' });
        token = response.body.token; // Store the token for authenticated requests
    });

    test('GET /api/items should return a list of items', async () => {
        const response = await request(app)
            .get('/api/items')
            .set('Authorization', `Bearer ${token}`); // Set the authorization header

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('items');
        expect(Array.isArray(response.body.items)).toBe(true);
    });

    test('POST /api/items should create a new item', async () => {
        const newItem = { name: 'New Item', price: 100 };

        const response = await request(app)
            .post('/api/items')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(newItem.name);
    });

    test('GET /api/items/:id should return a specific item', async () => {
        const itemId = 1; // Replace with a valid item ID

        const response = await request(app)
            .get(`/api/items/${itemId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', itemId);
    });

    test('PUT /api/items/:id should update an item', async () => {
        const itemId = 1; // Replace with a valid item ID
        const updatedItem = { name: 'Updated Item', price: 150 };

        const response = await request(app)
            .put(`/api/items/${itemId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedItem);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(updatedItem.name);
    });

    test('DELETE /api/items/:id should delete an item', async () => {
        const itemId = 1; // Replace with a valid item ID

        const response = await request(app)
            .delete(`/api/items/${itemId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(204); // No content
    });
});
