const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const botRoutes = require('./routes/bots');
const gameRoutes = require('./routes/games');
const playerRoutes = require('./routes/players');
const coachingRoutes = require('./routes/coaching');

// Routes
app.use('/api/bots', botRoutes(supabase));
app.use('/api/games', gameRoutes(supabase));
app.use('/api/players', playerRoutes(supabase));
app.use('/api/coaching', coachingRoutes(supabase));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Bot Backend running on port ${PORT}`);
  console.log(`📊 Supabase connected: ${process.env.SUPABASE_URL}`);
});

module.exports = { app, supabase };
