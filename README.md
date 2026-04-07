# Virtual Cosmos - 2D Proximity-Based Virtual Environment

> Real-time multiplayer virtual space where avatars move around and chat only when nearby.

[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.1-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

Virtual Cosmos is a real-time multiplayer environment with proximity-based chat. Move your avatar around a 2D canvas, and you can only message people within 150 pixels. Step away and the connection drops — same as a real conversation.

## Features

### Core
- Real-time avatar movement at 60 FPS via WASD or arrow keys
- Chat connects and disconnects automatically based on distance
- Multiple users visible and interactive at once
- Position updates sync across all clients instantly
- Visual indicators for connections and nearby users

### Extra
- Chat history saved in localStorage between sessions
- Click any connected user in the sidebar to focus their chat
- 1200×800 canvas — plenty of room to roam
- White circle around your avatar shows your connection radius
- Green/gray dots indicate who's in range

## Demo

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

**Quick test:**
1. Open two browser tabs
2. Enter different usernames (e.g., "Alice" and "Bob")
3. Move avatars close together with WASD
4. Chat panel opens automatically
5. Send messages
6. Move apart — chat closes, history stays

## Tech Stack

**Frontend:** React 19, PixiJS 8, Socket.IO Client, Tailwind CSS, Vite

**Backend:** Node.js, Express, Socket.IO, CORS

**Dev tools:** Nodemon, ESLint, Git

## Getting Started

### Prerequisites

- Node.js v14+
- npm or yarn
- Git

```bash
node --version  # v14 or higher
npm --version   # 6 or higher
```

### Installation

```bash
git clone https://github.com/yourusername/virtual-cosmos.git
cd virtual-cosmos

cd backend && npm install
cd ../frontend && npm install
```

### Running

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Starts on http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

**Optional startup script:**
```bash
#!/bin/bash
cd backend && npm run dev &
cd frontend && npm run dev &
wait
```

### Using the App

1. Go to `http://localhost:5173`
2. Enter a username and click "Join Lobby"
3. Move with WASD or arrow keys
4. Open multiple tabs with different usernames to test proximity chat

## Project Structure

```
virtual-cosmos/
├── backend/
│   ├── handlers/
│   │   ├── connectionHandlers.js
│   │   └── socketHandlers.js
│   ├── middleware/
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── services/
│   │   ├── connectionManager.js
│   │   ├── proximityDetector.js
│   │   └── userStateManager.js
│   ├── models/           # empty — ready for MongoDB
│   ├── routes/           # empty — ready for REST API
│   ├── tests/            # empty — ready for test suites
│   ├── .env
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── ConnectionStatus.jsx
│   │   │   └── CosmosWorld.jsx
│   │   ├── services/
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── README.md
├── LICENSE
└── package.json
```

## How It Works

### Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│  React Frontend │◄──────────────────────────►│  Node.js Backend│
│   + PixiJS      │    Socket.IO Events        │   + Socket.IO   │
└─────────────────┘                            └─────────────────┘
        │                                              │
        ▼                                              ▼
  ┌──────────┐                                  ┌──────────┐
  │ Canvas   │                                  │ Services │
  │ (PixiJS) │                                  │ State    │
  └──────────┘                                  │ Proximity│
                                                │ Conn.    │
                                                └──────────┘
```

### Frontend Components

- **CosmosWorld.jsx** — PixiJS canvas, keyboard input, avatar rendering at 60 FPS
- **ChatPanel.jsx** — Message display, input, localStorage persistence, auto-scroll
- **ConnectionStatus.jsx** — Online user list, connection indicators, click-to-focus
- **socket.js** — WebSocket client, position emits, event listeners, reconnection

### Backend Components

- **server.js** — Express + Socket.IO setup, CORS, event routing
- **socketHandlers.js** — Handles `user:join`, `position:move`, `chat:send`
- **proximityDetector.js** — Euclidean distance, connection open/close logic
- **userStateManager.js** — Tracks positions, connections, user metadata
- **connectionManager.js** — Notifies clients of connection changes

### Movement Flow

```
WASD input detected
  → Update local position (60 FPS)
  → Emit position:move to server (throttled at 16ms)
  → Server recalculates distances to all users
  → Broadcasts updated position to all clients
  → Sends connection:established or connection:terminated to affected users
  → All clients re-render avatar positions
```

## API Documentation

### Client → Server

```javascript
socket.emit('user:join', { username: string, position?: { x, y } });
socket.emit('position:move', { position: { x, y } });
socket.emit('chat:send', { message: string });
```

### Server → Client

```javascript
socket.on('users:list', (users: Array<{ userId, username, position }>));
socket.on('user:joined', ({ userId, username, position }));
socket.on('user:left', ({ userId }));
socket.on('position:update', ({ userId, position }));
socket.on('connection:established', ({ userId, username }));
socket.on('connection:terminated', ({ userId }));
socket.on('chat:message', ({ userId, username, message, timestamp }));
```

## Testing

### Manual

**Single user:** Join, test WASD movement, verify smooth avatar control.

**Multi-user:** Open 2–3 tabs with different usernames. Move avatars together and confirm chat opens. Send messages. Move apart and confirm chat closes but history persists.

**Edge cases:** Rapid movement, canvas boundaries, disconnect/reconnect, 5+ simultaneous users, rate limiting.

### Automated (planned)

`tests/` folders are in place for Jest unit tests, integration tests, and Playwright/Cypress E2E tests.

## Deployment

### Backend (Heroku)

```bash
heroku create virtual-cosmos-backend
heroku config:set NODE_ENV=production PORT=3000
git subtree push --prefix backend heroku main
```

### Frontend (Vercel)

```bash
npm install -g vercel
cd frontend && vercel --prod
```

Update `frontend/.env`:
```env
VITE_SOCKET_URL=https://your-backend-url.herokuapp.com
```

### Environment Variables

**backend/.env**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-url.vercel.app
PROXIMITY_RADIUS=150
CANVAS_WIDTH=1200
CANVAS_HEIGHT=800
```

**frontend/.env**
```env
VITE_SOCKET_URL=https://your-backend-url.herokuapp.com
```

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a pull request

Follow the ESLint config, write clear commit messages, and comment anything non-obvious.

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

Built for the Upskill Mafia MERN Internship. Inspired by [Cosmos.video](https://cosmos.video/).

## Contact

- **Author:** [Your Name]
- **Email:** your.email@example.com
- **GitHub:** [@yourusername](https://github.com/yourusername)
- **LinkedIn:** [Your LinkedIn](https://linkedin.com/in/yourprofile)

## Planned

- MongoDB for persistent storage
- JWT authentication
- Private messaging
- Voice chat
- Multiple rooms
- User profiles/avatars
- Message reactions
- Typing indicators
- Mobile controls
- Admin dashboard

---

*Built for Upskill Mafia MERN Internship*
