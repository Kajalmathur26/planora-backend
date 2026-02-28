const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const supabase = require('./config/supabase');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const journalRoutes = require('./routes/journalRoutes');
const goalRoutes = require('./routes/goalRoutes');
const habitRoutes = require('./routes/habitRoutes');
const moodRoutes = require('./routes/moodRoutes');
const eventRoutes = require('./routes/eventRoutes');
const aiRoutes = require('./routes/aiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

const isSupabaseConnectionError = (error) => {
  if (!error) return false;
  const text = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return text.includes('fetch failed') || text.includes('connect timeout');
};

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Logging & parsing
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', async (req, res) => {
  const response = {
    status: 'ok',
    message: 'Planora API is running',
    db: 'up',
    timestamp: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      response.status = 'degraded';
      response.db = 'down';
      response.message = 'Planora API running, database unavailable';
      response.db_error = isSupabaseConnectionError(error) ? 'supabase_connection_timeout' : 'supabase_query_error';
      return res.status(503).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    response.status = 'degraded';
    response.db = 'down';
    response.message = 'Planora API running, database unavailable';
    response.db_error = isSupabaseConnectionError(error) ? 'supabase_connection_timeout' : 'unknown_db_error';
    return res.status(503).json(response);
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
