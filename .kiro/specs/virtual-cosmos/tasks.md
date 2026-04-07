# Implementation Plan: Virtual Cosmos

## Overview

Virtual Cosmos is a real-time, proximity-based virtual environment with a React + PixiJS frontend and Node.js + Express + Socket.IO backend. The implementation follows a phased approach: backend core services first, then frontend rendering and UI, followed by integration and testing. The system uses JavaScript throughout (Node.js backend, React frontend).

## Tasks

- [x] 1. Backend: Core server setup and infrastructure
  - [x] 1.1 Initialize Node.js project and install dependencies
    - Create `backend/` directory with `package.json`
    - Install: `express`, `socket.io`, `cors`, `dotenv`, `mongoose` (optional)
    - Install dev dependencies: `nodemon`, `jest`
    - Set up npm scripts for development and testing
    - _Requirements: 1.2, 9.1_

  - [x] 1.2 Create Express server with Socket.IO integration
    - Create `backend/server.js` with Express app initialization
    - Integrate Socket.IO server with CORS configuration
    - Add basic middleware (express.json, cors)
    - Create health check endpoint (`GET /health`)
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 Implement UserStateManager service
    - Create `backend/services/userStateManager.js`
    - Implement in-memory Map for user state storage
    - Methods: `addUser`, `removeUser`, `updatePosition`, `getUser`, `getAllUsers`, `getUserCount`
    - Methods: `addConnection`, `removeConnection`, `getConnections`
    - _Requirements: 1.2, 1.4, 4.1_

  - [x] 1.4 Create input validation middleware
    - Create `backend/middleware/validator.js`
    - Implement `isNumeric`, `isPositionValid`, `isUsernameValid`, `isMessageValid`
    - Implement `sanitizeMessage` for XSS prevention
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 1.5 Write property tests for validation functions
    - **Property 2: Position boundary validation**
    - **Validates: Requirements 2.5, 10.2**
    - **Property 4: Message length validation**
    - **Validates: Requirements 5.5**
    - **Property 6: Numeric input validation**
    - **Validates: Requirements 10.1**
    - **Property 7: XSS sanitization**
    - **Validates: Requirements 10.3**
    - **Property 8: Username length validation**
    - **Validates: Requirements 10.4**

  - [x] 1.6 Implement rate limiting middleware
    - Create `backend/middleware/rateLimiter.js`
    - Implement RateLimiter class with `checkLimit` and `reset` methods
    - Configure position update limit (100/sec) and chat limit (10/sec)
    - _Requirements: 10.6_

- [x] 2. Backend: Proximity detection algorithm
  - [x] 2.1 Implement ProximityDetector service
    - Create `backend/services/proximityDetector.js`
    - Implement `calculateDistance` using Euclidean formula
    - Implement `checkProximity` to compare distance against radius
    - Implement `updateConnections` to detect new/terminated connections
    - Default proximity radius: 150 pixels
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [ ]* 2.2 Write property tests for proximity detection
    - **Property 1: Euclidean distance calculation correctness**
    - **Validates: Requirements 4.5**
    - **Property 3: Connection state transitions**
    - **Validates: Requirements 4.2, 6.1**

- [x] 3. Backend: Connection management
  - [x] 3.1 Implement ConnectionManager service
    - Create `backend/services/connectionManager.js`
    - Implement `establishConnection` to notify both users
    - Implement `terminateConnection` to notify both users
    - Methods emit Socket.IO events: `connection:established`, `connection:terminated`
    - _Requirements: 4.3, 6.2_

  - [x] 3.2 Create Socket.IO connection handlers
    - Create `backend/handlers/connectionHandlers.js`
    - Handle `connection` event: log new connection
    - Handle `disconnect` event: clean up user state, terminate all connections, broadcast `user:left`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 4. Backend: Socket.IO event handlers
  - [x] 4.1 Implement user:join handler
    - Create `backend/handlers/socketHandlers.js`
    - Validate username input
    - Add user to UserStateManager with initial position
    - Emit `users:list` to new user with all active users
    - Broadcast `user:joined` to all other clients
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Implement position:move handler
    - Validate position data (numeric, within bounds)
    - Check rate limit (100 updates/sec)
    - Update user position in UserStateManager
    - Call ProximityDetector.updateConnections
    - Notify new/terminated connections via ConnectionManager
    - Broadcast `position:update` to all clients
    - _Requirements: 2.1, 2.3, 3.1, 3.2, 4.1, 4.2, 10.6_

  - [x] 4.3 Implement chat:send handler
    - Validate message (non-empty, max 500 chars)
    - Check rate limit (10 messages/sec)
    - Sanitize message for XSS prevention
    - Get user's connections from UserStateManager
    - Emit `chat:message` only to connected users
    - Echo message back to sender
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 10.3_

  - [x] 4.4 Add comprehensive error handling
    - Wrap all handlers in try-catch blocks
    - Emit `error` events with type and message
    - Log errors to console
    - Handle validation errors, rate limit errors, state errors
    - _Requirements: 10.5_

- [ ] 5. Checkpoint - Backend core complete
  - Ensure all backend tests pass
  - Manually test Socket.IO events using a client tool (e.g., socket.io-client CLI)
  - Ask the user if questions arise

- [ ] 6. Frontend: Project setup and structure
  - [ ] 6.1 Initialize React + Vite project
    - Create `frontend/` directory
    - Run `npm create vite@latest . -- --template react`
    - Install dependencies: `pixi.js`, `socket.io-client`, `tailwindcss`, `postcss`, `autoprefixer`
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ] 6.2 Configure Tailwind CSS
    - Run `npx tailwindcss init -p`
    - Configure `tailwind.config.js` with content paths
    - Update `src/index.css` with Tailwind directives
    - _Requirements: 12.5_

  - [ ] 6.3 Create project folder structure
    - Create `src/components/` for React components
    - Create `src/services/` for Socket.IO client
    - Create `src/utils/` for helper functions
    - Create `src/constants/` for configuration values
    - _Requirements: 1.1_

  - [ ] 6.4 Create shared configuration constants
    - Create `src/constants/config.js`
    - Define: CANVAS_WIDTH (800), CANVAS_HEIGHT (600), PROXIMITY_RADIUS (150)
    - Define: MAX_USERNAME_LENGTH (50), MAX_MESSAGE_LENGTH (500)
    - Define: SOCKET_URL from environment variable
    - _Requirements: 4.6, 10.4, 5.5_

- [ ] 7. Frontend: Socket.IO client service
  - [ ] 7.1 Implement Socket service singleton
    - Create `src/services/socket.js`
    - Export singleton Socket.IO client instance
    - Implement `connect(username)` method
    - Implement `disconnect()` method
    - _Requirements: 1.2, 9.5_

  - [ ] 7.2 Add Socket event emitters
    - Implement `emitPositionMove(position)` method
    - Implement `emitChatSend(message)` method
    - Implement `emitUserLeave()` method
    - _Requirements: 2.3, 5.2_

  - [ ] 7.3 Add Socket event listeners
    - Implement `onUserJoined(callback)` method
    - Implement `onUserLeft(callback)` method
    - Implement `onPositionUpdate(callback)` method
    - Implement `onConnectionEstablished(callback)` method
    - Implement `onConnectionTerminated(callback)` method
    - Implement `onChatMessage(callback)` method
    - Implement `onUsersList(callback)` method
    - Implement `onError(callback)` method
    - _Requirements: 1.3, 3.3, 3.4, 5.4, 9.4_

  - [ ] 7.4 Add connection error handling
    - Handle `connect_error` event with user notification
    - Handle `disconnect` event with reconnection logic
    - Handle `reconnect` event with state re-sync
    - _Requirements: 9.5, 9.6_

- [ ] 8. Frontend: PixiJS canvas and rendering
  - [ ] 8.1 Create CosmosWorld component
    - Create `src/components/CosmosWorld.jsx`
    - Initialize PixiJS Application with canvas dimensions
    - Attach PixiJS view to DOM element
    - Handle PixiJS initialization errors
    - _Requirements: 1.1, 1.5, 7.1_

  - [ ] 8.2 Implement avatar rendering
    - Create `renderAvatar(user)` method to create/update avatar sprites
    - Display avatar as colored circle with username label
    - Implement `removeAvatar(userId)` method
    - Store avatar sprites in Map for efficient lookup
    - _Requirements: 1.5, 7.2, 7.4_

  - [ ] 8.3 Implement keyboard input handling
    - Add event listeners for WASD and Arrow keys
    - Calculate new position based on key press (movement speed: 5px/frame)
    - Validate position stays within canvas bounds
    - Call `onPositionUpdate` callback with new position
    - Stop movement when key is released
    - _Requirements: 2.1, 2.2, 2.5, 2.6_

  - [ ] 8.4 Implement smooth avatar animation
    - Update avatar positions on `position:update` events
    - Use PixiJS ticker for 60 FPS rendering
    - Implement smooth interpolation for remote avatar movement
    - _Requirements: 2.4, 3.2, 11.3_

  - [ ] 8.5 Add connection visualization
    - Draw lines between connected avatars
    - Highlight connected avatars with distinct visual style
    - Optional: Draw proximity radius circle around each avatar
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 8.6 Write unit tests for CosmosWorld component
    - Test PixiJS initialization
    - Test avatar rendering and removal
    - Test keyboard input handling
    - Test boundary validation

- [ ] 9. Frontend: Chat UI components
  - [ ] 9.1 Create ChatPanel component
    - Create `src/components/ChatPanel.jsx`
    - Accept props: `connections`, `messages`, `onSendMessage`, `isVisible`
    - Display list of connected users
    - Display messages with username, text, and timestamp
    - Show/hide panel based on `isVisible` prop
    - _Requirements: 5.1, 5.4, 8.4_

  - [ ] 9.2 Implement message input and submission
    - Add text input field for message composition
    - Validate message length (max 500 chars) before sending
    - Call `onSendMessage` callback on form submit
    - Clear input field after sending
    - Disable input when no connections exist
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ] 9.3 Implement message display and ordering
    - Render messages in chronological order by timestamp
    - Format timestamps as readable time (e.g., "2:30 PM")
    - Auto-scroll to bottom when new message arrives
    - Clear messages when connection terminates
    - _Requirements: 5.4, 5.6, 6.4_

  - [ ] 9.4 Add visual transitions
    - Animate panel appearance on connection established
    - Animate panel disappearance on connection terminated
    - Use Tailwind CSS transitions for smooth effects
    - _Requirements: 4.4, 6.3_

  - [ ]* 9.5 Write unit tests for ChatPanel component
    - Test message display in chronological order
    - Test input validation
    - Test panel visibility based on connections
    - Test auto-scroll behavior

- [ ] 10. Frontend: Connection status UI
  - [ ] 10.1 Create ConnectionStatus component
    - Create `src/components/ConnectionStatus.jsx`
    - Accept props: `activeUsers`, `isConnected`, `connections`
    - Display active user count
    - Display connection status indicator (connected/disconnected)
    - Display list of currently connected usernames
    - _Requirements: 7.1, 7.5, 8.4_

  - [ ] 10.2 Add visual indicators
    - Green indicator when connected to server
    - Red indicator when disconnected
    - Yellow indicator when reconnecting
    - Display "Reconnecting..." message during reconnection
    - _Requirements: 9.5_

  - [ ]* 10.3 Write unit tests for ConnectionStatus component
    - Test active user count display
    - Test connection status indicators
    - Test connected users list

- [ ] 11. Frontend: Main App integration
  - [ ] 11.1 Create App component with state management
    - Create `src/App.jsx` as main component
    - Use React useState for: users, currentUserId, connections, messages, isConnected
    - Initialize Socket service on component mount
    - Handle username input on first load
    - _Requirements: 1.1, 1.2_

  - [ ] 11.2 Wire Socket event listeners to state updates
    - On `users:list`: set users state
    - On `user:joined`: add user to users state
    - On `user:left`: remove user from users state, remove avatar
    - On `position:update`: update user position in state
    - On `connection:established`: add to connections, show chat panel
    - On `connection:terminated`: remove from connections, hide chat panel, clear messages
    - On `chat:message`: add message to messages state
    - On `error`: display error notification
    - _Requirements: 1.3, 1.4, 3.3, 3.4, 3.5, 4.3, 4.4, 5.4, 6.2, 6.3, 6.4, 7.3, 9.4_

  - [ ] 11.3 Implement position update throttling
    - Throttle position updates to 60 per second (16ms interval)
    - Track last update timestamp to prevent excessive emits
    - _Requirements: 2.2, 11.1_

  - [ ] 11.4 Add error notification system
    - Create toast/notification component for errors
    - Display connection errors, validation errors, rate limit errors
    - Auto-dismiss notifications after 5 seconds
    - _Requirements: 9.5, 10.5_

- [ ] 12. Checkpoint - Frontend core complete
  - Ensure all frontend tests pass
  - Manually test UI components in isolation
  - Ask the user if questions arise

- [ ] 13. Integration: Connect frontend to backend
  - [ ] 13.1 Configure environment variables
    - Create `frontend/.env` with `VITE_SOCKET_URL`
    - Create `backend/.env` with `PORT`, `NODE_ENV`, `CORS_ORIGIN`
    - Update Socket service to use environment variable
    - _Requirements: 1.2_

  - [ ] 13.2 Test end-to-end user flow
    - Start backend server
    - Start frontend dev server
    - Test: User joins with username
    - Test: User sees other users on canvas
    - Test: User moves avatar with keyboard
    - Test: Other users see position updates in real-time
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 3.1, 3.2_

  - [ ] 13.3 Test proximity detection and chat
    - Test: Move two users within proximity radius
    - Test: Connection established notification appears
    - Test: Chat panel appears for both users
    - Test: Send chat messages between connected users
    - Test: Move users apart
    - Test: Connection terminated notification appears
    - Test: Chat panel disappears
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

  - [ ] 13.4 Test disconnection handling
    - Test: User closes browser tab
    - Test: Other users see "user left" notification
    - Test: Avatar removed from canvas
    - Test: Connections terminated for disconnected user
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 13.5 Write integration tests for Socket.IO events
    - Test user join/leave flow
    - Test position update broadcasting
    - Test proximity detection triggering connections
    - Test chat message routing to connected users only
    - Test reconnection and state restoration

- [ ] 14. Testing: Property-based tests
  - [ ]* 14.1 Set up fast-check testing framework
    - Install `fast-check` in backend
    - Create `backend/tests/unit/` directory
    - Configure Jest to run property tests

  - [ ]* 14.2 Implement all property tests from design
    - Create `proximityDetector.property.test.js` for Properties 1 and 3
    - Create `validator.property.test.js` for Properties 2, 4, 6, 7, 8
    - Create `messageService.property.test.js` for Property 5
    - Run 100 iterations per property test
    - Tag each test with property number and requirements

- [ ] 15. Testing: Performance validation
  - [ ]* 15.1 Write performance tests
    - Test position update latency < 50ms
    - Test chat message latency < 100ms
    - Test proximity detection completes within 16ms for 20 users
    - Test canvas rendering maintains 60 FPS with 20 users

  - [ ]* 15.2 Run performance benchmarks
    - Simulate 20 concurrent users
    - Measure average latency for position updates
    - Measure average latency for chat messages
    - Verify all metrics meet requirements
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 16. Polish and documentation
  - [ ] 16.1 Add README with setup instructions
    - Document prerequisites (Node.js version)
    - Document backend setup and start commands
    - Document frontend setup and start commands
    - Document environment variable configuration
    - Include architecture diagram

  - [ ] 16.2 Add code comments and documentation
    - Document all public methods with JSDoc comments
    - Add inline comments for complex algorithms (proximity detection)
    - Document Socket.IO event contracts

  - [ ] 16.3 Create demo video
    - Record 2-5 minute demo showing:
      - Multiple users joining
      - Avatar movement
      - Proximity-based connections
      - Chat functionality
      - Disconnection handling
    - Upload to GitHub repository

  - [ ] 16.4 Cross-browser testing
    - Test in Chrome 90+
    - Test in Firefox 88+
    - Test in Safari 14+
    - Test in Edge 90+
    - Verify responsive layout at 1024px+ viewport width
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 17. Final checkpoint - Project complete
  - Ensure all tests pass (unit, integration, property-based)
  - Verify all requirements are met
  - Ensure demo video is complete
  - Ensure README is comprehensive
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation uses JavaScript throughout (Node.js backend, React frontend)
- Property-based tests validate universal correctness properties using fast-check
- Integration tests verify Socket.IO event flows and end-to-end scenarios
- MongoDB integration is optional and not included in core tasks
- Checkpoints ensure incremental validation at key milestones
- The design document provides detailed implementation guidance for each component
