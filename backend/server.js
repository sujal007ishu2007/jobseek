const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Build dynamic CORS allowlist
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// FRONTEND_URL supports a single origin; CORS_ORIGINS can be a comma-separated list
const envAllowed = [];
if (process.env.FRONTEND_URL) envAllowed.push(process.env.FRONTEND_URL.trim());
if (process.env.CORS_ORIGINS) {
  envAllowed.push(
    ...process.env.CORS_ORIGINS
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

// Optionally keep a known deployed URL if already configured in envs/docs
const staticKnown = [
  'https://jobseek-jfzv.vercel.app',
];

const allowlist = [...new Set([...defaultAllowedOrigins, ...envAllowed, ...staticKnown])];

// Allow any Vercel preview/prod subdomain if desired (restricted by regex)
const vercelRegex = /https?:\/\/[a-z0-9-]+\.vercel\.app$/i;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (like curl, health checks) where origin is undefined
      if (!origin) return callback(null, true);

      const isAllowed =
        allowlist.includes(origin) ||
        vercelRegex.test(origin);

      if (isAllowed) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

// Helpful log at startup
console.log('[CORS] Allowlist:', allowlist);
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobmanagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  // Basic route for development
  app.get('/', (req, res) => {
    res.json({ message: 'Job Management API is running!' });
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
