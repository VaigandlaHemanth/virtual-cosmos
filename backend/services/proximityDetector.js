/**
 * ProximityDetector
 * Calculates distances between users and manages proximity-based connections
 */
class ProximityDetector {
  /**
   * @param {number} radius - Proximity radius in pixels (default: 150)
   */
  constructor(radius = 150) {
    this.radius = parseInt(process.env.PROXIMITY_RADIUS) || radius;
    console.log(`[ProximityDetector] Initialized with radius: ${this.radius}px`);
  }

  /**
   * Calculate Euclidean distance between two positions
   * @param {Object} pos1 - First position {x, y}
   * @param {Object} pos2 - Second position {x, y}
   * @returns {number} Distance in pixels
   */
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if two users are within proximity
   * @param {Object} user1 - First user object
   * @param {Object} user2 - Second user object
   * @returns {boolean} True if within proximity radius
   */
  checkProximity(user1, user2) {
    const distance = this.calculateDistance(user1.position, user2.position);
    return distance < this.radius;
  }

  /**
   * Update connections for a user based on proximity to all other users
   * @param {string} userId - Socket ID of the user who moved
   * @param {Map} allUsers - Map of all users
   * @returns {Object} {newConnections: Array, terminatedConnections: Array}
   */
  updateConnections(userId, allUsers) {
    const newConnections = [];
    const terminatedConnections = [];
    const currentUser = allUsers.get(userId);

    if (!currentUser) {
      return { newConnections, terminatedConnections };
    }

    // Check proximity with all other users
    for (const [otherUserId, otherUser] of allUsers) {
      if (otherUserId === userId) continue;

      const distance = this.calculateDistance(
        currentUser.position,
        otherUser.position
      );

      const wasConnected = currentUser.connections.has(otherUserId);
      const inProximity = distance < this.radius;

      if (inProximity && !wasConnected) {
        // Establish new connection
        currentUser.connections.add(otherUserId);
        otherUser.connections.add(userId);
        
        newConnections.push({
          userId: otherUserId,
          username: otherUser.username
        });

        console.log(`[Proximity] Connection established: ${currentUser.username} <-> ${otherUser.username} (distance: ${Math.round(distance)}px)`);
      } else if (!inProximity && wasConnected) {
        // Terminate existing connection
        currentUser.connections.delete(otherUserId);
        otherUser.connections.delete(userId);
        
        terminatedConnections.push(otherUserId);

        console.log(`[Proximity] Connection terminated: ${currentUser.username} <-> ${otherUser.username} (distance: ${Math.round(distance)}px)`);
      }
    }

    return { newConnections, terminatedConnections };
  }

  /**
   * Get all users within proximity of a specific user
   * @param {string} userId - Socket ID
   * @param {Map} allUsers - Map of all users
   * @returns {Array} Array of nearby user objects
   */
  getNearbyUsers(userId, allUsers) {
    const currentUser = allUsers.get(userId);
    if (!currentUser) return [];

    const nearbyUsers = [];

    for (const [otherUserId, otherUser] of allUsers) {
      if (otherUserId === userId) continue;

      if (this.checkProximity(currentUser, otherUser)) {
        nearbyUsers.push({
          userId: otherUserId,
          username: otherUser.username,
          position: otherUser.position
        });
      }
    }

    return nearbyUsers;
  }

  /**
   * Set proximity radius
   * @param {number} radius - New radius in pixels
   */
  setRadius(radius) {
    this.radius = radius;
    console.log(`[ProximityDetector] Radius updated to: ${this.radius}px`);
  }

  /**
   * Get current proximity radius
   * @returns {number} Current radius in pixels
   */
  getRadius() {
    return this.radius;
  }
}

// Export singleton instance
module.exports = new ProximityDetector();
