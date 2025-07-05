const mongoose = require('mongoose');

const websiteDataSchema = new mongoose.Schema({
    domain: { type: String, required: true },
    totalTime: { type: Number, default: 0 }, // in milliseconds
    productiveTime: { type: Number, default: 0 }, // in milliseconds
    unproductiveTime: { type: Number, default: 0 } // in milliseconds
});

const userActivitySchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true }, // User ID from the extension
    date: { type: Date, default: Date.now, index: true }, // Date of the activity (can be set to start of day)
    data: { type: Map, of: websiteDataSchema, default: {} } // Map of domains to their data
}, { timestamps: true });

// Ensure unique entry per user per day (optional, depending on how you aggregate)
// For simplicity, we'll upsert based on userId and date.
userActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('UserActivity', userActivitySchema);
