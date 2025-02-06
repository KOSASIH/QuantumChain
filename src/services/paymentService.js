// services/paymentService.js

const express = require('express');
const Stripe = require('stripe');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('combined'));

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoClient.connect();
        db = mongoClient.db(process.env.DB_NAME);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Endpoint to create a payment intent
app.post('/create-payment-intent', async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });

        // Store transaction in the database
        await db.collection('transactions').insertOne({
            amount,
            currency,
            status: 'pending',
            paymentIntentId: paymentIntent.id,
            createdAt: new Date(),
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send('Error creating payment intent');
    }
});

// Webhook to handle payment status updates
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await db.collection('transactions').updateOne(
                { paymentIntentId: paymentIntent.id },
                { $set: { status: 'succeeded' } }
            );
            console.log('PaymentIntent was successful!');
            break;
        case 'payment_intent.payment_failed':
            const failedPaymentIntent = event.data.object;
            await db.collection('transactions').updateOne(
                { paymentIntentId: failedPaymentIntent.id },
                { $set: { status: 'failed' } }
            );
            console.log('PaymentIntent failed.');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Payment service is running on port ${PORT}`);
});

// Connect to the database
connectDB();
