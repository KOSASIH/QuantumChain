// services/notificationService.js

const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const WebSocket = require('ws');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('combined'));

// Twilio setup for SMS
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer setup for email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// WebSocket server for real-time notifications
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Function to send email notifications
async function sendEmailNotification(to, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent:', subject);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Function to send SMS notifications
async function sendSMSNotification(to, message) {
    try {
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log('SMS sent:', message);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

// Function to send WebSocket notifications
function sendWebSocketNotification(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Example event handler
app.post('/notify', async (req, res) => {
    const { type, recipient, subject, message } = req.body;

    try {
        if (type === 'email') {
            await sendEmailNotification(recipient, subject, message);
        } else if (type === 'sms') {
            await sendSMSNotification(recipient, message);
        } else if (type === 'websocket') {
            sendWebSocketNotification({ message });
        } else {
            return res.status(400).send('Invalid notification type');
        }

        res.status(200).send('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).send('Error sending notification');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Notification service is running on port ${PORT}`);
});

// Upgrade HTTP server to handle WebSocket connections
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
