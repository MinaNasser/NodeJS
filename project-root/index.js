// // index.js placeholder
// import { httpServer } from './app.js';

// const PORT = process.env.PORT || 5000;

// httpServer.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });

import { app } from './app.js';
import connectDB from './src/config/db.js';
import configureSocket from './src/config/socket.js';
import http from 'http';
import { validateEnv } from './src/utils/validateEnv.js';

// Validate environment variables
if (!validateEnv()) {
  process.exit(1);
}

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.io
const io = configureSocket(server);

// Make io accessible to the app
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});