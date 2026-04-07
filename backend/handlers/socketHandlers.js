/**
 * Socket Event Handlers
 * Handles Socket.IO events: user:join, position:move, chat:send
 */

const userStateManager = require('../services/userStateManager');
const proximityDetector = require('../services/proximityDetector');
const connectionManager = require('../services/connectionManager');
const validator = require('../middleware/validator');
const rateLimiter = require('../middleware/rateLimiter');

/**
 * Handle user:join event
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 */
function handleUserJoin(io, socket) {
  return (data) => {
    try {
      const { username, position } = data;

      // Validate username
      const usernameValidation = validator.isUsernameValid(username);
      if (!usernameValidation.valid) {
        socket.emit('error', {
          type: 'validation',
          message: usernameValidation.error
        });
        return;
      }

      // Validate position if provided
      if (position) {
        const positionValidation = validator.isPositionValid(position);
        if (!positionValidation.valid) {
          socket.emit('error', {
            type: 'validation',
            message: positionValidation.error
          });
          return;
        }
      }

      // Store username on socket for later reference
      socket.username = username;

      // Add user to state manager
      const user = userStateManager.addUser(socket.id, {
        username,
        position: position || { x: 600, y: 400 } // Default center position for 1200x800 canvas
      });

      // Send list of all active users to the new user
      const allUsers = userStateManager.getUsersArray();
      console.log(`[UserJoin] Sending users:list to ${username}:`, allUsers);
      socket.emit('users:list', allUsers);
      console.log(`[UserJoin] users:list emitted successfully`);

      // Broadcast user:joined to all other clients
      console.log(`[UserJoin] Broadcasting user:joined to all other clients`);
      socket.broadcast.emit('user:joined', {
        userId: socket.id,
        username: user.username,
        position: user.position
      });

      console.log(`[UserJoin] ${username} joined at position (${user.position.x}, ${user.position.y})`);
      console.log(`[UserJoin] Total users now: ${userStateManager.getUserCount()}`);
    } catch (error) {
      console.error('[UserJoin] Error:', error);
      socket.emit('error', {
        type: 'server',
        message: 'Failed to join'
      });
    }
  };
}

/**
 * Handle position:move event
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 */
function handlePositionMove(io, socket) {
  return (data) => {
    try {
      const { position } = data;

      // Validate position
      const positionValidation = validator.isPositionValid(position);
      if (!positionValidation.valid) {
        socket.emit('error', {
          type: 'validation',
          message: positionValidation.error
        });
        return;
      }

      // Check rate limit (100 updates per second)
      if (!rateLimiter.positionRateLimiter.checkLimit(socket.id)) {
        socket.emit('error', {
          type: 'rate_limit',
          message: 'Position update rate limit exceeded'
        });
        return;
      }

      // Update user position
      const updated = userStateManager.updatePosition(socket.id, position);
      if (!updated) {
        socket.emit('error', {
          type: 'state',
          message: 'User not found in state'
        });
        return;
      }

      // Check proximity and update connections
      const allUsers = userStateManager.getAllUsers();
      const { newConnections, terminatedConnections } = proximityDetector.updateConnections(
        socket.id,
        allUsers
      );

      // Notify about new connections
      for (const connection of newConnections) {
        connectionManager.establishConnection(
          io,
          socket.id,
          connection.userId,
          connection.username
        );
      }

      // Notify about terminated connections
      for (const terminatedUserId of terminatedConnections) {
        connectionManager.terminateConnection(
          io,
          socket.id,
          terminatedUserId
        );
      }

      // Broadcast position update to all clients
      io.emit('position:update', {
        userId: socket.id,
        position: position
      });

    } catch (error) {
      console.error('[PositionMove] Error:', error);
      socket.emit('error', {
        type: 'server',
        message: 'Failed to update position'
      });
    }
  };
}

/**
 * Handle chat:send event
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 */
function handleChatSend(io, socket) {
  return (data) => {
    try {
      const { message } = data;

      // Validate message
      const messageValidation = validator.isMessageValid(message);
      if (!messageValidation.valid) {
        socket.emit('error', {
          type: 'validation',
          message: messageValidation.error
        });
        return;
      }

      // Check rate limit (10 messages per second)
      if (!rateLimiter.chatRateLimiter.checkLimit(socket.id)) {
        socket.emit('error', {
          type: 'rate_limit',
          message: 'Chat rate limit exceeded'
        });
        return;
      }

      // Sanitize message for XSS prevention
      const sanitizedMessage = validator.sanitizeMessage(message);

      // Get user's connections
      const connections = userStateManager.getConnections(socket.id);
      const user = userStateManager.getUser(socket.id);

      if (!user) {
        socket.emit('error', {
          type: 'state',
          message: 'User not found in state'
        });
        return;
      }

      // Create message object
      const chatMessage = {
        userId: socket.id,
        username: user.username,
        message: sanitizedMessage,
        timestamp: Date.now()
      };

      // Send message to all connected users
      for (const connectedUserId of connections) {
        io.to(connectedUserId).emit('chat:message', chatMessage);
      }

      // Echo message back to sender
      socket.emit('chat:message', chatMessage);

      console.log(`[Chat] ${user.username} -> ${connections.length} users: "${sanitizedMessage.substring(0, 50)}${sanitizedMessage.length > 50 ? '...' : ''}"`);

    } catch (error) {
      console.error('[ChatSend] Error:', error);
      socket.emit('error', {
        type: 'server',
        message: 'Failed to send message'
      });
    }
  };
}

module.exports = {
  handleUserJoin,
  handlePositionMove,
  handleChatSend
};
