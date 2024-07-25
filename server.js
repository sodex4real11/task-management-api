const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const user = require('./models/User')

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./API/routes/authRoutes'));
app.use('/api/tasks', require('./API/routes/taskRoutes'));
app.use('/', function(res, req) {
res.json("Hello World")
})

// Controllers
// app.use('/api/auth', require('./API/Controllers/authController'));

// Database connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch((error) => console.error('Database connection error:', error));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
