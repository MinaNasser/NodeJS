// app.js placeholder
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import connectDB from './src/config/db.js';
import { errorHandler, notFound } from './src/middlewares/errorMiddleware.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import videoRoutes from './src/routes/videoRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import likeDislikeRoutes from './src/routes/likeDislikeRoutes.js';
import followRoutes from './src/routes/followRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

// Load env vars
config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Make io available in req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Video Management API',
      version: '1.0.0',
      description: 'A REST API for video management with authentication, comments, likes, and more',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeDislikeRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export { app, httpServer, io };