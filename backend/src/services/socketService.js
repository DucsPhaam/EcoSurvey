/**
 * @module SocketService
 * @description Quản lý kết nối thời gian thực WebSockets (Socket.IO), xác thực client kết nối và hỗ trợ gửi thông báo tức thì (real-time notification, new_badge) tới thiết bị người dùng.
 * 
 * @function init
 * @description Khởi tạo Socket.IO Server gắn với HTTP Server, cài đặt middleware xác thực JWT và quản lý danh sách socket theo `userId`.
 * @param {Object} server - Thể hiện Node.js HTTP Server.
 * 
 * @function emitToUser
 * @description Gửi sự kiện thời gian thực tới một người dùng cụ thể dựa trên `user_${userId}` room.
 * @param {number} userId - Mã ID người dùng nhận sự kiện.
 * @param {string} event - Tên sự kiện (ví dụ: 'new_notification', 'new_badge').
 * @param {any} data - Dữ liệu truyền kèm theo.
 * 
 * @function getIo
 * @description Trả về đối tượng `io` instance của Socket.IO Server.
 * 
 * @implementation
 * - Bước 1: Khởi tạo `Server` từ `socket.io` với CORS origin từ `CLIENT_URL`.
 * - Bước 2: Đăng ký middleware xác thực JWT token từ `socket.handshake.auth.token`.
 * - Bước 3: Đưa socket vào phòng riêng `user_${userId}` khi kết nối thành công (`connection`).
 * - Bước 4: Lắng nghe sự kiện `disconnect` để giải phóng socket khỏi bộ nhớ Map `userSockets`.
 * 
 * @relations
 * - Đơn vị khởi tạo: `server.js` (`backend/src/server.js`).
 * - Services & Controllers phát tin: `badgeService.js`, `adminController.js`, `participationController.js`.
 * - Frontend Context nhận tin: `SocketContext.jsx` (`frontend/src/contexts/SocketContext.jsx`).
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;
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
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me_in_production_very_long_secret');
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
