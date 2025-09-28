const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');
const analyticsRoutes = require('./routes/analytics');

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// ----------------- CORS Setup -----------------
const allowedOrigins = [
  'http://localhost:3000',
  'https://ai-mentor-snowy.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);

    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error(`CORS error: ${origin} not allowed by server`));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));


// -----------------------------------------------

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ----------------- Routes -----------------
app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Code Review Mentor API is running' });
});
// -------------------------------------------

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ----------------- MongoDB Connection -----------------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  console.log("Maestro DB Connection available:", !!process.env.MAESTRO_DB_CONNECTION);
  console.log("Maestro Service Token available:", !!process.env.MAESTRO_SERVICE_TOKEN);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
