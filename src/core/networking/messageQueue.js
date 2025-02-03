// src/core/networking/messageQueue.js

class MessageQueue {
    constructor() {
        this.queue = []; // Array to hold messages
        this.processing = false; // Flag to indicate if the queue is being processed
    }

    // Method to add a message to the queue
    enqueue(message) {
        this.queue.push(message); // Add the message to the end of the queue
        this.processQueue(); // Start processing the queue if not already processing
    }

    // Method to process the queue
    async processQueue() {
        if (this.processing) return; // Exit if already processing
        this.processing = true; // Set processing flag

        while (this.queue.length > 0) {
            const message = this.queue.shift(); // Get the next message from the queue
            await this.handleMessage(message); // Handle the message asynchronously
        }

        this.processing = false; // Reset processing flag
    }

    // Method to handle a message
    async handleMessage(message) {
        try {
            // Simulate message handling (this could be any asynchronous operation)
            console.log('Processing message:', message);
            // Here you can add logic to handle different types of messages
            // For example, you could call different functions based on message type
            await this.simulateAsyncOperation(message);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }

    // Simulated asynchronous operation (for demonstration purposes)
    async simulateAsyncOperation(message) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Message processed:', message);
                resolve();
            }, 1000); // Simulate a delay of 1 second
        });
    }
}

module.exports = { MessageQueue };
