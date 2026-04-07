import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(username) {
    const socketUrl = 'http://localhost:3000';
    console.log('[Socket] Initializing connection to:', socketUrl);
    console.log('[Socket] Username:', username);
    
    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['polling', 'websocket']
    });

    this.socket.on('connect', () => {
      console.log('[Socket] ✅ Connection successful!');
      console.log('[Socket] Socket ID:', this.socket.id);
      console.log('[Socket] Transport:', this.socket.io.engine.transport.name);
      console.log('[Socket] Emitting user:join with username:', username);
      
      this.socket.emit('user:join', { username });
      
      // Debug: Listen for ALL events
      this.socket.onAny((eventName, ...args) => {
        console.log(`[Socket] ⚡ RECEIVED EVENT: '${eventName}'`, args);
      });
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] ❌ Connection error:', err.message);
      console.error('[Socket] Error type:', err.type);
      console.error('[Socket] Error description:', err.description);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] ⚠️ Disconnected. Reason:', reason);
    });
    
    this.socket.on('error', (err) => {
      console.error('[Socket] Server error:', err);
    });

    // Register all default event listeners
    this._registerListeners();
  }

  _registerListeners() {
    if (!this.socket) return;
    console.log('[Socket] Registering listeners for:', Array.from(this.listeners.keys()));
    for (const [event, callbacks] of this.listeners.entries()) {
      this.socket.on(event, (data) => {
        console.log(`[Socket] Event '${event}' received:`, data);
        callbacks.forEach(cb => cb(data));
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit('user:leave');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // --- Emits ---
  emitPositionMove(position) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('position:move', { position });
    }
  }

  emitChatSend(message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('chat:send', { message });
    }
  }

  // --- Listeners Registration ---
  _addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
      if (this.socket) {
        // dynamic attach if socket exists
        console.log(`[Socket] Dynamically attaching listener for '${event}'`);
        this.socket.on(event, (data) => {
          console.log(`[Socket] Event '${event}' received:`, data);
          this.listeners.get(event).forEach(cb => cb(data));
        });
      }
    }
    this.listeners.get(event).push(callback);
  }

  onUserJoined(callback) { this._addListener('user:joined', callback); }
  onUserLeft(callback) { this._addListener('user:left', callback); }
  onPositionUpdate(callback) { this._addListener('position:update', callback); }
  onConnectionEstablished(callback) { this._addListener('connection:established', callback); }
  onConnectionTerminated(callback) { this._addListener('connection:terminated', callback); }
  onChatMessage(callback) { this._addListener('chat:message', callback); }
  onUsersList(callback) { this._addListener('users:list', callback); }
}

const socketService = new SocketService();
export default socketService;
