const express = require('express');
const app = express();
const topicRoutes = require('./routes/topicRoutes');
const path = require('path');
const userRoutes = require('./routes/userRoutes');

// ... other middleware
app.use('/api/topics', topicRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/users', userRoutes);

// ... other imports

module.exports = app; 