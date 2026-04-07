require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { handleConnection, handleDisconnect } = require('./handlers/connectionHandlers');
const { handleUserJoin, handlePositionMove, handleChatSend } = require('./handlers/socketHandlers');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: corsOptions
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Server] ===== NEW CONNECTION =====`);
  console.log(`[Server] Socket ID: ${socket.id}`);
  console.log(`[Server] Transport: ${socket.conn.transport.name}`);
  
  handleConnection(io, socket);
  
  // User join event
  console.log(`[Server] Registering user:join handler for socket ${socket.id}`);
  socket.on('user:join', (data) => {
    console.log(`[Server] ===== RECEIVED user:join EVENT =====`);
    console.log(`[Server] Data:`, data);
    handleUserJoin(io, socket)(data);
  });
  
  // Position move event
  socket.on('position:move', handlePositionMove(io, socket));
  
  // Chat send event
  socket.on('chat:send', handleChatSend(io, socket));
  
  socket.on('disconnect', handleDisconnect(io, socket));
  
  console.log(`[Server] All handlers registered for socket ${socket.id}`);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Virtual Cosmos Backend Server`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Socket.IO ready for connections\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = { app, server, io };
