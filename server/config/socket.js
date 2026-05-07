import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User comes online
    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });

    // Join project room
    socket.on('project:join', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    // Leave project room
    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Task updated
    socket.on('task:update', (data) => {
      socket.to(`project:${data.projectId}`).emit('task:updated', data);
    });

    // New comment
    socket.on('comment:new', (data) => {
      socket.to(`project:${data.projectId}`).emit('comment:added', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('users:online', Array.from(onlineUsers.keys()));
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
