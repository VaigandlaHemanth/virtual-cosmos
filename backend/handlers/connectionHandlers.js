/**
 * Connection Handlers
 * Handles Socket.IO connection and disconnection events
 */

const userStateManager = require('../services/userStateManager');
const connectionManager = require('../services/connectionManager');

/**
 * Handle new socket connection
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 */
function handleConnection(io, socket) {
  console.log(`[${new Date().toISOString()}] User connected: ${socket.id}`);
  
  // Store socket reference for username lookup
  socket.username = null;
}

/**
 * Handle socket disconnection
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 */
function handleDisconnect(io, socket) {
  return () => {
    console.log(`[${new Date().toISOString()}] User disconnected: ${socket.id}`);
    
    // Get user data before removal
    const user = userStateManager.getUser(socket.id);
    
    if (user) {
      // Terminate all connections for this user
      connectionManager.terminateAllConnections(io, socket.id, user.connections);
      
      // Remove user from state
      userStateManager.removeUser(socket.id);
      
      // Broadcast user:left to all other clients
      socket.broadcast.emit('user:left', {
        userId: socket.id,
        username: user.username
      });
      
      console.log(`[Disconnect] Cleaned up user: ${user.username} (${socket.id})`);
    }
  };
}

module.exports = {
  handleConnection,
  handleDisconnect
};
