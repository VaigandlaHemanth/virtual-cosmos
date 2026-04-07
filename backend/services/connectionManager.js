/**
 * ConnectionManager
 * Manages connection establishment and termination between users
 */
class ConnectionManager {
  /**
   * Establish a connection between two users
   * @param {Object} io - Socket.IO server instance
   * @param {string} userId1 - First user socket ID
   * @param {string} userId2 - Second user socket ID
   * @param {string} username2 - Second user's username
   */
  establishConnection(io, userId1, userId2, username2) {
    // Notify first user about the connection
    io.to(userId1).emit('connection:established', {
      userId: userId2,
      username: username2
    });

    // Get first user's username to notify second user
    const socket1 = io.sockets.sockets.get(userId1);
    if (socket1 && socket1.username) {
      io.to(userId2).emit('connection:established', {
        userId: userId1,
        username: socket1.username
      });
    }

    console.log(`[Connection] Established: ${userId1} <-> ${userId2}`);
  }

  /**
   * Terminate a connection between two users
   * @param {Object} io - Socket.IO server instance
   * @param {string} userId1 - First user socket ID
   * @param {string} userId2 - Second user socket ID
   */
  terminateConnection(io, userId1, userId2) {
    // Notify both users about the disconnection
    io.to(userId1).emit('connection:terminated', {
      userId: userId2
    });

    io.to(userId2).emit('connection:terminated', {
      userId: userId1
    });

    console.log(`[Connection] Terminated: ${userId1} <-> ${userId2}`);
  }

  /**
   * Terminate all connections for a user (when they disconnect)
   * @param {Object} io - Socket.IO server instance
   * @param {string} userId - User socket ID
   * @param {Set} connections - Set of connected user IDs
   */
  terminateAllConnections(io, userId, connections) {
    if (!connections || connections.size === 0) return;

    console.log(`[Connection] Terminating all connections for user: ${userId}`);

    // Notify all connected users
    for (const connectedUserId of connections) {
      io.to(connectedUserId).emit('connection:terminated', {
        userId: userId
      });
    }

    connections.clear();
  }
}

// Export singleton instance
module.exports = new ConnectionManager();
