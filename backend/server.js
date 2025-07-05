const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const PORT = process.env.PORT || 4000; // Backend API server port
const MONGODB_URI = 'mongodb://localhost:27017/productivity_tracker'; // Your MongoDB URI

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from React dashboard
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', activityRoutes); // All activity related routes under /api

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Productivity Tracker Backend API');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`MongoDB URI: ${MONGODB_URI}`);
});
