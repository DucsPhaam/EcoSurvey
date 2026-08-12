// Server entrypoint: Initializes Express server, security middleware, API routes, Socket.IO, and DB connection.
require('dotenv').config();

// Fail fast in production if critical secrets are missing.
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('[server] Missing required environment variable: JWT_SECRET');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const { sequelize } = require('./config/database');
const logger = require('./utils/logger');
const cronService = require('./services/cronService');
const { allowedOrigins } = require('./config/clientOrigins');

// ── Routes ────────────────────────────────────────────────────
const authRoutes          = require('./routes/authRoutes');
const adminRoutes         = require('./routes/adminRoutes');
const surveyRoutes        = require('./routes/surveyRoutes');
const participationRoutes = require('./routes/participationRoutes');
const dashboardRoutes     = require('./routes/dashboardRoutes');
const leaderboardRoutes   = require('./routes/leaderboardRoutes');
const notificationRoutes  = require('./routes/notificationRoutes');
const homepageRoutes      = require('./routes/homepageRoutes');
const aiRoutes            = require('./routes/aiRoutes');
const faqPublicRoutes     = require('./routes/faqPublicRoutes');
const exportRoutes        = require('./routes/exportRoutes');
const userRoutes          = require('./routes/userRoutes');
const fileRoutes          = require('./routes/fileRoutes');

const app = express();
app.set('trust proxy', 1);

// ── Security Middleware ───────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      connectSrc:  ["'self'"],
      objectSrc:   ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

const { generalLimiter } = require('./middleware/rateLimitMiddleware');
app.use(generalLimiter);

// ── Parsers ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const passport = require('./config/passport');
app.use(passport.initialize());

// Serves uploads directory statically in development environment.
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));
  logger.warn('⚠️  /uploads served as static (dev only). In production, use /api/files/:filename.');
}

// ── Router Mounts ─────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/auth',               authRoutes); // Fallback alias for direct calls / OAuth callbacks missing /api prefix
app.use('/api/admin',          adminRoutes);
app.use('/api/surveys',        surveyRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/dashboard',      dashboardRoutes);
app.use('/api/leaderboard',    leaderboardRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/homepage',       homepageRoutes);
app.use('/api/ai',             aiRoutes);
app.use('/api/faqs',           faqPublicRoutes);
app.use('/api/export',         exportRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/files',          fileRoutes);

// ── Health Check Endpoint ──────────────────────────────────────
// Returns server health check status.
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// ── 404 Handler ───────────────────────────────────────────────
// Handles 404 Not Found requests.
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ──────────────────────────────────────
// Error handling middleware: Catches and formats unhandled application errors.
app.use((err, _req, res, _next) => {
  logger.error(err.stack || err.message);
  if (err.oauthError) {
    logger.error('OAuth Inner Error:', err.oauthError);
  }
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

module.exports = app;

const http = require('http');
const socketService = require('./services/socketService');

// ── HTTP & Socket.IO Server Initialization ────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  
  const server = http.createServer(app);
  socketService.init(server);

  (async () => {
    try {
      await sequelize.authenticate();
      logger.info('✅ Database connection established');
      await sequelize.sync();
      logger.info('✅ Database schema synchronized');

      // Ensure MySQL status column ENUM contains 'Locked'
      await sequelize.query("ALTER TABLE users MODIFY COLUMN status ENUM('Pending','Approved','Rejected','Locked','Deactivated') DEFAULT 'Pending';").catch(err => {
        logger.warn('⚠️ Could not alter users status column:', err.message);
      });

      cronService.start();

      const emailService = require('./services/emailService');
      await emailService.verifySmtpConnection();
      
      server.listen(PORT, () => {
        logger.info(`🚀 EcoSurvey API & Socket.io running on port ${PORT}`);
      });
    } catch (err) {
      logger.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  })();
}
