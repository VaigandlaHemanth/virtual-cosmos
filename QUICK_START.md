# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/virtual-cosmos.git
cd virtual-cosmos
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Server running on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ App running on http://localhost:5173

### 4. Test It!

1. Open http://localhost:5173
2. Enter username "Alice"
3. Click "Join Lobby"
4. Open another tab
5. Enter username "Bob"
6. Move close with WASD keys
7. Start chatting! 💬

---

## 📋 What You Need

- Node.js v14+
- npm or yarn
- Modern browser (Chrome, Firefox, Safari)

---

## 🎮 Controls

- **WASD** or **Arrow Keys** - Move avatar
- **Click canvas** - Focus for keyboard input
- **Click user** - Focus chat panel
- **Type & Enter** - Send message

---

## 🆘 Troubleshooting

**Backend won't start?**
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

**Frontend won't start?**
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

**Can't see other users?**
- Check both servers are running
- Open browser console (F12)
- Look for Socket.IO connection logs

---

## 📚 More Info

- Full documentation: [README.md](README.md)
- Testing guide: [TEST_CHECKLIST.md](TEST_CHECKLIST.md)
- Architecture: [MERN_STACK_ANALYSIS.md](MERN_STACK_ANALYSIS.md)

---

**That's it! You're ready to go!** 🎉
