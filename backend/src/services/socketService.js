const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;
// Map to store connected sockets: userId -> Set of socketIds
const userSockets = new Map();

exports.init = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me_in_production_very_long_secret');
      socket.user = decoded; // { id, role, ... }
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info(`🔌 Socket connected: User ${userId} (Socket ID: ${socket.id})`);

    // Add socket to user's set
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join a room specifically for this user (alternative to map, but both work)
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

/**
 * Emits an event to a specific user
 * @param {number} userId 
 * @param {string} event 
 * @param {any} data 
 */
exports.emitToUser = (userId, event, data) => {
  if (!io) return;
  // Emit to the user's room
  io.to(`user_${userId}`).emit(event, data);
};

exports.getIo = () => io;
