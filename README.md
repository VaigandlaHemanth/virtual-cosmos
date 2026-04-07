# Virtual Cosmos - 2D Proximity-Based Virtual Environment

> A real-time multiplayer virtual space where users can move around and chat with others when they're nearby.

[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.1-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## 🌟 Overview

Virtual Cosmos is a real-time multiplayer virtual environment that simulates proximity-based communication. Users can move their avatars in a 2D space, and chat connections are automatically established when users come within 150 pixels of each other. The system provides a seamless, real-time experience with smooth animations and instant communication.

**Key Concept:** Just like in real life, you can only chat with people who are nearby. Move close to start a conversation, move away to end it.

## ✨ Features

### Core Features
- 🎮 **Real-Time Movement** - Smooth 60 FPS avatar movement using WASD or arrow keys
- 💬 **Proximity-Based Chat** - Automatic chat connection/disconnection based on distance
- 👥 **Multi-User Support** - See and interact with multiple users simultaneously
- 🔄 **Live Synchronization** - Real-time position updates across all connected clients
- 🎨 **Visual Feedback** - Clear indicators for connections, positions, and user status

### Enhanced Features
- 💾 **Persistent Chat History** - Messages saved in localStorage across sessions
- 🖱️ **Click-to-Focus** - Click on connected users to quickly access chat
- 📏 **Expanded Canvas** - Large 1200x800 pixel canvas for comfortable navigation
- 🎯 **Proximity Visualization** - White circle showing your connection radius
- 🔔 **Connection Indicators** - Green/gray dots showing who's in range

## 🎬 Demo

### Screenshots

**Main Interface**
```
┌─────────────────────────────────────────────────────────────┐
│  Upskill Mafia MERN          Space    Call    Logged in as  │
├──────────┬──────────────────────────────────────┬───────────┤
│          │                                      │ Proximity │
│  Team    │         [Canvas Area]                │   Chat    │
│  (3)     │                                      │           │
│          │    ⚪ You (Green)                    │ 2 Nearby  │
│  • Alice │    ⚪ Bob (Gray)                     │           │
│  • Bob   │    ⚪ Charlie (Gray)                 │ Messages  │
│  • You   │                                      │ appear    │
│          │    [White circle = proximity range]  │ here      │
│          │                                      │           │
└──────────┴──────────────────────────────────────┴───────────┘
```

### Quick Demo
1. Open two browser tabs
2. Enter different usernames (e.g., "Alice" and "Bob")
3. Move avatars close together using WASD keys
4. Watch chat panel appear automatically
5. Send messages back and forth
6. Move apart - chat disappears but history persists!

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework with hooks
- **PixiJS 8** - High-performance 2D rendering engine
- **Socket.IO Client** - Real-time bidirectional communication
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Minimal web framework
- **Socket.IO** - WebSocket server for real-time events
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Nodemon** - Auto-restart server on changes
- **ESLint** - Code linting
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)

Check your installations:
```bash
node --version  # Should be v14 or higher
npm --version   # Should be 6 or higher
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/virtual-cosmos.git
cd virtual-cosmos
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

#### Option 1: Run Both Servers Separately

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
✅ Backend will start on `http://localhost:3000`

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```
✅ Frontend will start on `http://localhost:5173`

#### Option 2: Quick Start Script (Optional)

Create a `start.sh` file in the root directory:
```bash
#!/bin/bash
# Start backend
cd backend && npm run dev &
# Start frontend
cd frontend && npm run dev &
wait
```

Then run:
```bash
chmod +x start.sh
./start.sh
```

### Accessing the Application

1. Open your browser
2. Navigate to `http://localhost:5173`
3. Enter a username
4. Click "Join Lobby"
5. Use WASD or arrow keys to move around!

**Testing with Multiple Users:**
- Open multiple browser tabs or windows
- Use different usernames in each
- Move avatars close together to start chatting

## 📁 Project Structure

```
virtual-cosmos/
├── backend/                    # Node.js + Express + Socket.IO server
│   ├── handlers/              # Socket.IO event handlers
│   │   ├── connectionHandlers.js
│   │   └── socketHandlers.js
│   ├── middleware/            # Validation and rate limiting
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── services/              # Business logic
│   │   ├── connectionManager.js
│   │   ├── proximityDetector.js
│   │   └── userStateManager.js
│   ├── models/               # (Empty - ready for MongoDB)
│   ├── routes/               # (Empty - ready for REST API)
│   ├── tests/                # (Empty - ready for tests)
│   ├── .env                  # Environment variables
│   ├── .env.example          # Example environment file
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
│
├── frontend/                  # React + PixiJS + Tailwind frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── ConnectionStatus.jsx
│   │   │   └── CosmosWorld.jsx
│   │   ├── services/         # Socket.IO client
│   │   │   └── socket.js
│   │   ├── assets/           # Images and static files
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── public/               # Public assets
│   ├── .env                  # Frontend environment variables
│   ├── index.html            # HTML template
│   ├── vite.config.js        # Vite configuration
│   └── package.json          # Frontend dependencies
│
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── LICENSE                   # MIT License
└── package.json              # Root package file (optional)
```

## 🔧 How It Works

### Architecture Overview

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │◄──────────────────────────►│                 │
│  React Frontend │    Socket.IO Events        │  Node.js Backend│
│   + PixiJS      │                            │   + Socket.IO   │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
        │                                              │
        │                                              │
        ▼                                              ▼
  ┌──────────┐                                  ┌──────────┐
  │ Canvas   │                                  │ Services │
  │ Rendering│                                  │ - State  │
  │ (PixiJS) │                                  │ - Prox.  │
  └──────────┘                                  │ - Conn.  │
                                                └──────────┘
```

### Key Components

#### Frontend (React + PixiJS)
1. **CosmosWorld.jsx** - Main canvas component
   - Renders avatars using PixiJS
   - Handles WASD keyboard input
   - Updates positions at 60 FPS
   - Manages avatar sprites

2. **ChatPanel.jsx** - Chat interface
   - Displays messages
   - Handles message input
   - Persists history in localStorage
   - Auto-scrolls to latest message

3. **ConnectionStatus.jsx** - User list sidebar
   - Shows all online users
   - Visual connection indicators
   - Click-to-focus functionality

4. **socket.js** - Socket.IO client service
   - Manages WebSocket connection
   - Emits position updates
   - Listens for events
   - Handles reconnection

#### Backend (Node.js + Socket.IO)
1. **server.js** - Main server
   - Express HTTP server
   - Socket.IO initialization
   - CORS configuration
   - Event routing

2. **socketHandlers.js** - Event handlers
   - `user:join` - User connection
   - `position:move` - Position updates
   - `chat:send` - Chat messages

3. **proximityDetector.js** - Distance calculation
   - Euclidean distance formula
   - Connection establishment
   - Connection termination

4. **userStateManager.js** - State management
   - User positions
   - Active connections
   - User metadata

5. **connectionManager.js** - Connection logic
   - Notify connection establishment
   - Notify connection termination
   - Manage connection state

### Real-Time Communication Flow

```
User Moves Avatar
      ↓
Frontend detects WASD input
      ↓
Update local position (60 FPS)
      ↓
Emit 'position:move' to server (throttled to 16ms)
      ↓
Server receives position update
      ↓
Calculate distances to all users
      ↓
Check if new connections/disconnections
      ↓
Broadcast position to all clients
      ↓
Notify affected users of connection changes
      ↓
All clients update avatar positions
```

## 📡 API Documentation

### Socket.IO Events

#### Client → Server

**`user:join`**
```javascript
socket.emit('user:join', {
  username: string,
  position?: { x: number, y: number }
});
```

**`position:move`**
```javascript
socket.emit('position:move', {
  position: { x: number, y: number }
});
```

**`chat:send`**
```javascript
socket.emit('chat:send', {
  message: string
});
```

#### Server → Client

**`users:list`**
```javascript
socket.on('users:list', (users: Array<{
  userId: string,
  username: string,
  position: { x: number, y: number }
}>));
```

**`user:joined`**
```javascript
socket.on('user:joined', (data: {
  userId: string,
  username: string,
  position: { x: number, y: number }
}));
```

**`user:left`**
```javascript
socket.on('user:left', (data: {
  userId: string
}));
```

**`position:update`**
```javascript
socket.on('position:update', (data: {
  userId: string,
  position: { x: number, y: number }
}));
```

**`connection:established`**
```javascript
socket.on('connection:established', (data: {
  userId: string,
  username: string
}));
```

**`connection:terminated`**
```javascript
socket.on('connection:terminated', (data: {
  userId: string
}));
```

**`chat:message`**
```javascript
socket.on('chat:message', (data: {
  userId: string,
  username: string,
  message: string,
  timestamp: number
}));
```

## 🧪 Testing

### Manual Testing

1. **Single User Test**
```bash
# Start both servers
# Open http://localhost:5173
# Enter username and join
# Test WASD movement
# Verify avatar moves smoothly
```

2. **Multi-User Test**
```bash
# Open 2-3 browser tabs
# Enter different usernames
# Move avatars close together
# Verify chat panel appears
# Send messages
# Verify messages appear in all connected tabs
# Move apart
# Verify chat panel disappears
# Move close again
# Verify chat history persists
```

3. **Edge Cases**
```bash
# Test rapid movement
# Test boundary detection
# Test disconnection/reconnection
# Test with 5+ users
# Test message rate limiting
```

### Automated Testing (Future)

The project structure includes empty `tests/` folders ready for:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright/Cypress)

## 🚢 Deployment

### Backend Deployment (Heroku Example)

1. **Create Heroku app**
```bash
heroku create virtual-cosmos-backend
```

2. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
```

3. **Deploy**
```bash
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Vercel Example)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel --prod
```

3. **Update Socket URL**
```bash
# Update frontend/.env
VITE_SOCKET_URL=https://your-backend-url.herokuapp.com
```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-url.vercel.app
PROXIMITY_RADIUS=150
CANVAS_WIDTH=1200
CANVAS_HEIGHT=800
```

**Frontend (.env)**
```env
VITE_SOCKET_URL=https://your-backend-url.herokuapp.com
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration provided
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Assignment:** Upskill Mafia MERN Internship
- **Design Inspiration:** [Cosmos.video](https://cosmos.video/)
- **Technologies:** React, Node.js, Socket.IO, PixiJS
- **Community:** Thanks to all contributors and testers

## 📞 Contact & Support

- **Author:** [Your Name]
- **Email:** [your.email@example.com]
- **GitHub:** [@yourusername](https://github.com/yourusername)
- **LinkedIn:** [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🔮 Future Enhancements

- [ ] MongoDB integration for persistent storage
- [ ] User authentication (JWT)
- [ ] Private messaging
- [ ] Voice chat integration
- [ ] Multiple rooms/spaces
- [ ] User profiles and avatars
- [ ] Message reactions
- [ ] Typing indicators
- [ ] Mobile responsive controls
- [ ] Admin dashboard

---

**Built with ❤️ for Upskill Mafia MERN Internship**

⭐ Star this repo if you found it helpful!
