require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const { sequelize } = require('./config/database');
const logger = require('./utils/logger');
const cronService = require('./services/cronService');

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
const fileRoutes          = require('./routes/fileRoutes'); // FIX #16

const app = express();
app.set('trust proxy', 1);
// ── Security Middleware ───────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'"],          // Allow inline scripts (Vite/React)
      styleSrc:    ["'self'", "'unsafe-inline'",           // Allow inline styles
                    "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "blob:",
                    "https://res.cloudinary.com"],         // Cloudinary (Phase 4)
      connectSrc:  ["'self'"],
      objectSrc:   ["'none'"],
      frameAncestors: ["'none'"],                          // Prevent clickjacking
    },
  },
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false, // Needed for Leaflet map tiles
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── Parsers ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const passport = require('./config/passport');
app.use(passport.initialize());

// FIX #16: Không còn serve /uploads dưới dạng static công khai nữa.
// Thay bằng /api/files/:filename với authentication.
// Giữ lại static serve CHỈ trong môi trường development để tiện debug.
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));
  logger.warn('⚠️  /uploads served as static (dev only). In production, use /api/files/:filename.');
}

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
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
app.use('/api/files',          fileRoutes); // FIX #16: Authenticated file serving

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  logger.error(err.stack || err.message);
  if (err.oauthError) {
    logger.error('OAuth Inner Error:', err.oauthError);
  }
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

// ── Export app for testing ─────────────────────────────────────
module.exports = app;

const http = require('http');
const socketService = require('./services/socketService');

// ── Start server (only outside test environment) ──────────────
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  
  // Create HTTP server instead of using app.listen directly
  const server = http.createServer(app);
  
  // Initialize Socket.io
  socketService.init(server);

  (async () => {
    try {
      await sequelize.authenticate();
      logger.info('✅ Database connection established');
      await sequelize.sync();
      logger.info('✅ Database synced');
      cronService.start();
      
      server.listen(PORT, () => {
        logger.info(`🚀 EcoSurvey API & Socket.io running on port ${PORT}`);
      });
    } catch (err) {
      logger.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  })();
}
