/**
 * @module ServerEntryPoint
 * @description Tệp khởi tạo chính của máy chủ Express Backend EcoSurvey, tích hợp các middleware bảo mật, routes, Socket.IO, Sequelize DB, và Cron Jobs.
 * 
 * @implementation
 * - Bước 1: Nạp biến môi trường từ tệp `.env`.
 * - Bước 2: Thiết lập Express app, cấu hình `trust proxy` để hoạt động chính xác đằng sau Nginx / Reverse Proxy.
 * - Bước 3: Đăng ký middleware bảo mật Helmet (Content-Security-Policy, HSTS, Referrer-Policy) và CORS (cho phép kết nối từ CLIENT_URL).
 * - Bước 4: Đăng ký Body Parser (JSON limit 10mb, URL Encoded) và Cookie Parser.
 * - Bước 5: Khởi tạo Passport.js hỗ trợ xác thực Google OAuth 2.0.
 * - Bước 6: Đăng ký tất cả các Router API (/api/auth, /api/admin, /api/surveys, /api/participations, /api/dashboard, /api/leaderboard, /api/notifications, /api/homepage, /api/ai, /api/faqs, /api/export, /api/users, /api/files).
 * - Bước 7: Cấu hình endpoint kiểm tra sức khỏe `/api/health`, 404 Not Found handler và Middleware xử lý lỗi toàn cục.
 * - Bước 8: Trong môi trường chạy thực tế (không phải test), tạo HTTP Server, khởi tạo Socket.IO qua `socketService.init(server)`, kết nối DB MySQL qua Sequelize, bật `cronService.start()` và lắng nghe cổng PORT (mặc định 5000).
 * 
 * @relations
 * - Config: `config/database.js`, `config/passport.js`.
 * - Services: `services/cronService.js`, `services/socketService.js`.
 * - Routes: Tất cả các route trong `backend/src/routes/*.js`.
 * - Frontend: Điểm truy cập cho tất cả các request API từ Frontend (`frontend/src/services/*`).
 */
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

// Phục vụ tĩnh thư mục uploads trong môi trường development
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));
  logger.warn('⚠️  /uploads served as static (dev only). In production, use /api/files/:filename.');
}

// ── Router Mounts ─────────────────────────────────────────────
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
app.use('/api/files',          fileRoutes);

// ── Health Check Endpoint ──────────────────────────────────────
/**
 * @function HealthCheckHandler
 * @description Trả về trạng thái hoạt động của API server.
 */
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// ── 404 Handler ───────────────────────────────────────────────
/**
 * @function NotFoundHandler
 * @description Xử lý các yêu cầu HTTP truy cập vào các đường dẫn không tồn tại.
 */
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ──────────────────────────────────────
/**
 * @function GlobalErrorHandler
 * @description Middleware bắt và trả về phản hồi chuẩn hóa cho tất cả các lỗi chưa được xử lý trong ứng dụng.
 */
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

// ── Khởi Chạy HTTP & Socket.io Server ────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  
  const server = http.createServer(app);
  socketService.init(server);

  (async () => {
    try {
      await sequelize.authenticate();
      logger.info('✅ Database connection established');
      await sequelize.sync({ alter: true });
      logger.info('✅ Database schema synchronized');
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
