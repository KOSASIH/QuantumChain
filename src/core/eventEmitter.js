// src/core/eventEmitter.js

class EventEmitter {
    constructor() {
        this.events = {}; // Object to hold event listeners
    }

    // Method to register an event listener
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = []; // Initialize the event array if it doesn't exist
        }
        this.events[event].push(listener); // Add the listener to the event array
    }

    // Method to emit an event, calling all registered listeners
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => {
                listener(...args); // Call each listener with the provided arguments
            });
        }
    }

    // Method to remove a specific listener for an event
    off(event, listener) {
        if (!this.events[event]) return; // Exit if the event doesn't exist

        this.events[event] = this.events[event].filter(l => l !== listener); // Remove the listener
    }

    // Method to remove all listeners for a specific event
    removeAllListeners(event) {
        if (this.events[event]) {
            delete this.events[event]; // Delete the event from the events object
        }
    }
}

module.exports = { EventEmitter };
