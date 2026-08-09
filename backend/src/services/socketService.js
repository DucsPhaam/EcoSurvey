// Socket service: Manages real-time WebSockets connections (Socket.IO), authenticates clients, and emits real-time notifications.
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { allowedOrigins } = require('../config/clientOrigins');

let io;
const userSockets = new Map();

exports.init = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info(`🔌 Socket connected: User ${userId} (Socket ID: ${socket.id})`);

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.join(`user_${userId}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: User ${userId} (Socket ID: ${socket.id})`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
};

exports.emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, data);
};

exports.getIo = () => io;
