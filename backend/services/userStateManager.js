/**
 * UserStateManager
 * Manages in-memory user state for all connected users
 */
class UserStateManager {
  constructor() {
    // Map<socketId, User>
    this.users = new Map();
  }

  /**
   * Add a new user to the state
   * @param {string} socketId - Socket.IO socket ID
   * @param {Object} userData - User data {username, position}
   */
  addUser(socketId, userData) {
    const user = {
      userId: socketId,
      username: userData.username,
      position: userData.position || { x: 400, y: 300 }, // Default center position
      connections: new Set(),
      lastUpdate: Date.now()
    };
    
    this.users.set(socketId, user);
    console.log(`[UserState] Added user: ${userData.username} (${socketId})`);
    return user;
  }

  /**
   * Remove a user from the state
   * @param {string} socketId - Socket.IO socket ID
   */
  removeUser(socketId) {
    const user = this.users.get(socketId);
    if (user) {
      console.log(`[UserState] Removed user: ${user.username} (${socketId})`);
      this.users.delete(socketId);
      return user;
    }
    return null;
  }

  /**
   * Update user position
   * @param {string} socketId - Socket.IO socket ID
   * @param {Object} position - New position {x, y}
   */
  updatePosition(socketId, position) {
    const user = this.users.get(socketId);
    if (user) {
      user.position = position;
      user.lastUpdate = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Get a specific user
   * @param {string} socketId - Socket.IO socket ID
   * @returns {Object|null} User object or null
   */
  getUser(socketId) {
    return this.users.get(socketId) || null;
  }

  /**
   * Get all users
   * @returns {Map} Map of all users
   */
  getAllUsers() {
    return this.users;
  }

  /**
   * Get user count
   * @returns {number} Number of active users
   */
  getUserCount() {
    return this.users.size;
  }

  /**
   * Add a connection between two users
   * @param {string} userId1 - First user socket ID
   * @param {string} userId2 - Second user socket ID
   */
  addConnection(userId1, userId2) {
    const user1 = this.users.get(userId1);
    const user2 = this.users.get(userId2);
    
    if (user1 && user2) {
      user1.connections.add(userId2);
      user2.connections.add(userId1);
      return true;
    }
    return false;
  }

  /**
   * Remove a connection between two users
   * @param {string} userId1 - First user socket ID
   * @param {string} userId2 - Second user socket ID
   */
  removeConnection(userId1, userId2) {
    const user1 = this.users.get(userId1);
    const user2 = this.users.get(userId2);
    
    if (user1 && user2) {
      user1.connections.delete(userId2);
      user2.connections.delete(userId1);
      return true;
    }
    return false;
  }

  /**
   * Get all connections for a user
   * @param {string} userId - Socket ID
   * @returns {Array<string>} Array of connected user IDs
   */
  getConnections(userId) {
    const user = this.users.get(userId);
    return user ? Array.from(user.connections) : [];
  }

  /**
   * Get all users as array (for broadcasting)
   * @returns {Array} Array of user objects
   */
  getUsersArray() {
    return Array.from(this.users.values()).map(user => ({
      userId: user.userId,
      username: user.username,
      position: user.position
    }));
  }
}

// Export singleton instance
module.exports = new UserStateManager();
