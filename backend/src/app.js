const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const promptRoutes = require('./routes/prompt.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();

// Security headers
app.use(helmet());

// CORS - restricted to the configured frontend origin
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Sanitize request data against NoSQL injection (strips $ and . operators)
app.use(mongoSanitize());

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting to prevent abuse
app.use(
  '/api',
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// Health check
app.get('/api/health', (req, res) => sendSuccess(res, { data: { status: 'ok' }, message: 'API is healthy' }));

// Routes
app.use('/api', promptRoutes);

// 404 + centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
