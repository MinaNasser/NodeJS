// socket.js placeholder
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join a room with the user's ID for private notifications
    if (socket.user) {
      socket.join(socket.user._id.toString());
      console.log(`User ${socket.user.username} joined room: ${socket.user._id}`);
    }
    
    // Handle real-time events
    socket.on('joinVideoRoom', (videoId) => {
      socket.join(`video:${videoId}`);
      console.log(`User joined video room: video:${videoId}`);
    });
    
    socket.on('leaveVideoRoom', (videoId) => {
      socket.leave(`video:${videoId}`);
      console.log(`User left video room: video:${videoId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export default configureSocket;