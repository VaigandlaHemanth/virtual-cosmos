import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import socketService from '../services/socket';

const CONFIG = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  PROXIMITY_RADIUS: 150,
};

const POSITION_UPDATE_INTERVAL = 16;

const CosmosWorld = ({ currentUsername }) => {
  const pixiContainer = useRef(null);
  const appRef = useRef(null);
  const usersMapRef = useRef(new Map());
  const myAvatarRef = useRef(null);
  const myPositionRef = useRef({ x: 600, y: 400 });
  const lastUpdateTimeRef = useRef(0);
  const lastDebugTimeRef = useRef(0);
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const [debugInfo, setDebugInfo] = useState({ keys: {}, pos: {}, users: 0 });

  // Helper to draw avatars
  const createAvatarSprite = (app, username, color, showRadius) => {
    const container = new PIXI.Container();

    if (showRadius) {
      const radius = new PIXI.Graphics();
      radius.circle(0, 0, CONFIG.PROXIMITY_RADIUS);
      radius.fill({ color: 0xFFFFFF, alpha: 0.1 });
      container.addChild(radius);
    }

    const circle = new PIXI.Graphics();
    circle.circle(0, 0, 15);
    circle.fill({ color });
    container.addChild(circle);

    const text = new PIXI.Text({ text: username, style: { fontSize: 12, fill: 0xffffff, align: 'center' }});
    text.anchor.set(0.5);
    text.position.y = -25;
    container.addChild(text);

    return container;
  };

  // Handle Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;
      const key = e.key.toLowerCase();
      if (['w', 'arrowup'].includes(key)) { keysRef.current.w = true; e.preventDefault(); }
      if (['s', 'arrowdown'].includes(key)) { keysRef.current.s = true; e.preventDefault(); }
      if (['a', 'arrowleft'].includes(key)) { keysRef.current.a = true; e.preventDefault(); }
      if (['d', 'arrowright'].includes(key)) { keysRef.current.d = true; e.preventDefault(); }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'arrowup'].includes(key)) keysRef.current.w = false;
      if (['s', 'arrowdown'].includes(key)) keysRef.current.s = false;
      if (['a', 'arrowleft'].includes(key)) keysRef.current.a = false;
      if (['d', 'arrowright'].includes(key)) keysRef.current.d = false;
    };
    const handleBlur = () => {
      keysRef.current = { w: false, a: false, s: false, d: false };
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!pixiContainer.current) return;

    // Register Socket Handlers FIRST, before PixiJS init
    console.log('[CosmosWorld] Registering socket listeners BEFORE PixiJS init');
    
    socketService.onUsersList((users) => {
      console.log('[CosmosWorld] ===== USERS LIST EVENT =====');
      console.log('[CosmosWorld] Received users:list:', users);
      console.log('[CosmosWorld] Type:', typeof users, 'Is Array:', Array.isArray(users));
      console.log('[CosmosWorld] Current username:', currentUsername);
      console.log('[CosmosWorld] App ready?', !!appRef.current);
      
      if (!appRef.current) {
        console.log('[CosmosWorld] ⏳ App not ready yet, will retry in 100ms');
        setTimeout(() => {
          if (appRef.current && isMounted) {
            console.log('[CosmosWorld] Retrying users:list processing...');
            processUsersList(users);
          }
        }, 100);
        return;
      }
      
      const usersArray = Array.isArray(users) ? users : (users && users.users) ? users.users : [];
      processUsersList(usersArray);
    });

    const processUsersList = (users) => {
      console.log('[CosmosWorld] ===== PROCESSING USERS LIST =====');
      console.log('[CosmosWorld] Current map size:', usersMapRef.current.size);
      console.log('[CosmosWorld] Current username:', currentUsername);
      console.log('[CosmosWorld] Received users:', users);
      console.log('[CosmosWorld] Is array?', Array.isArray(users));
      
      if (!Array.isArray(users)) {
        console.error('[CosmosWorld] ERROR: users is not an array!', users);
        return;
      }
      
      console.log('[CosmosWorld] Total users in list:', users.length);
      
      users.forEach((u, index) => {
        console.log(`[CosmosWorld] --- User ${index + 1}/${users.length} ---`);
        console.log('[CosmosWorld] User object:', JSON.stringify(u));
        console.log('[CosmosWorld] - userId:', u.userId);
        console.log('[CosmosWorld] - username:', u.username);
        console.log('[CosmosWorld] - position:', u.position);
        console.log('[CosmosWorld] - Current username:', currentUsername);
        console.log('[CosmosWorld] - Username match?', u.username === currentUsername);
        console.log('[CosmosWorld] - Already in map?', usersMapRef.current.has(u.userId));
        
        if (u.username !== currentUsername && !usersMapRef.current.has(u.userId)) {
          console.log('[CosmosWorld] ✅ ADDING USER:', u.username);
          const sprite = createAvatarSprite(appRef.current, u.username, 0x9CA3AF, false);
          sprite.position.set(u.position.x, u.position.y);
          appRef.current.stage.addChild(sprite);
          usersMapRef.current.set(u.userId, sprite);
          console.log('[CosmosWorld] ✅ User added successfully. Map size now:', usersMapRef.current.size);
        } else {
          if (u.username === currentUsername) {
            console.log('[CosmosWorld] ❌ Skipping: Same as current user');
          } else if (usersMapRef.current.has(u.userId)) {
            console.log('[CosmosWorld] ❌ Skipping: Already in map');
          }
        }
      });
      console.log('[CosmosWorld] ===== END USERS LIST (Final map size:', usersMapRef.current.size, ') =====');
    };

    socketService.onUserJoined((data) => {
      console.log('[CosmosWorld] ===== USER JOINED EVENT =====');
      console.log('[CosmosWorld] User joined:', data);
      console.log('[CosmosWorld] - Username:', data.username, 'vs current:', currentUsername);
      console.log('[CosmosWorld] - Already in map?', usersMapRef.current.has(data.userId));
      console.log('[CosmosWorld] - App ready?', !!appRef.current);
      
      if (!appRef.current) {
        console.log('[CosmosWorld] ⏳ App not ready yet, skipping');
        return;
      }
      
      if (data.username === currentUsername) {
        console.log('[CosmosWorld] ❌ Skipping (same username)');
        return;
      }
      
      if (!usersMapRef.current.has(data.userId)) {
        console.log('[CosmosWorld] ✅ Adding new user');
        const sprite = createAvatarSprite(appRef.current, data.username, 0x9CA3AF, false);
        sprite.position.set(data.position.x, data.position.y);
        appRef.current.stage.addChild(sprite);
        usersMapRef.current.set(data.userId, sprite);
        console.log('[CosmosWorld] Users map now has:', usersMapRef.current.size, 'users');
      } else {
        console.log('[CosmosWorld] ❌ User already in map');
      }
      console.log('[CosmosWorld] ===== END USER JOINED =====');
    });

    socketService.onPositionUpdate((data) => {
      const sprite = usersMapRef.current.get(data.userId);
      if (sprite) {
        sprite.position.set(data.position.x, data.position.y);
      }
    });

    socketService.onUserLeft((data) => {
      console.log('[CosmosWorld] User left:', data);
      const sprite = usersMapRef.current.get(data.userId);
      if (sprite && appRef.current) {
        appRef.current.stage.removeChild(sprite);
        sprite.destroy();
        usersMapRef.current.delete(data.userId);
        console.log('[CosmosWorld] Users map now has:', usersMapRef.current.size, 'users');
      }
    });

    // NOW connect to socket AFTER all listeners are registered
    console.log('[CosmosWorld] All listeners registered. Connecting to socket...');
    socketService.connect(currentUsername);

    // Initialize Pixi Application AFTER listeners are registered
    const initPixi = async () => {
      const app = new PIXI.Application();
      await app.init({
        width: CONFIG.CANVAS_WIDTH,
        height: CONFIG.CANVAS_HEIGHT,
        backgroundColor: 0x1a1a2e,
        antialias: true,
      });

      if (!isMounted) {
        app.destroy(true, { children: true });
        return;
      }

      appRef.current = app;
      
      // Clean up previous canvas if React strict mode appended twice
      while (pixiContainer.current.firstChild) {
        pixiContainer.current.removeChild(pixiContainer.current.firstChild);
      }
      pixiContainer.current.appendChild(app.canvas);
      
      // Make canvas responsive
      app.canvas.style.maxWidth = '100%';
      app.canvas.style.maxHeight = '100%';
      app.canvas.style.objectFit = 'contain';

      console.log('[CosmosWorld] PixiJS initialized for user:', currentUsername);

      // Create my Avatar
      myAvatarRef.current = createAvatarSprite(app, currentUsername, 0x4CAF50, true);
      app.stage.addChild(myAvatarRef.current);
      myAvatarRef.current.position.set(myPositionRef.current.x, myPositionRef.current.y);

      // Game Loop
      app.ticker.add(() => {
        let moved = false;
        const speed = 3;
        const pos = myPositionRef.current;

        if (keysRef.current.w) { pos.y -= speed; moved = true; }
        if (keysRef.current.s) { pos.y += speed; moved = true; }
        if (keysRef.current.a) { pos.x -= speed; moved = true; }
        if (keysRef.current.d) { pos.x += speed; moved = true; }

        if (moved) {
          // Clamp boundaries
          pos.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH, pos.x));
          pos.y = Math.max(0, Math.min(CONFIG.CANVAS_HEIGHT, pos.y));
          
          myAvatarRef.current.position.set(pos.x, pos.y);

          // Throttle network updates
          const now = Date.now();
          if (now - lastUpdateTimeRef.current >= POSITION_UPDATE_INTERVAL) {
            socketService.emitPositionMove({ x: pos.x, y: pos.y });
            lastUpdateTimeRef.current = now;
          }
        }

        // Throttle React state updates to 4 times a second so we don't freeze the main thread!
        const currentTime = Date.now();
        if (currentTime - lastDebugTimeRef.current > 250) {
          setDebugInfo({
            keys: {...keysRef.current},
            pos: {...pos},
            users: usersMapRef.current.size
          });
          lastDebugTimeRef.current = currentTime;
        }
      });
    };

    console.log('[CosmosWorld] Starting PixiJS initialization...');
    initPixi();

    // Auto-focus the container so keyboard inputs immediately trigger
    if (pixiContainer.current) {
      pixiContainer.current.focus();
    }

    return () => {
      isMounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [currentUsername]);

  return (
    <div className="w-full h-full flex justify-center items-center bg-transparent overflow-hidden relative">
      <div 
        ref={pixiContainer} 
        tabIndex="0"
        className="shadow-lg border border-gray-200 rounded-lg overflow-hidden outline-none cursor-pointer flex justify-center items-center bg-[#1a1a2e]" 
        style={{ 
          width: '100%', 
          height: '100%', 
          maxWidth: CONFIG.CANVAS_WIDTH, 
          maxHeight: CONFIG.CANVAS_HEIGHT 
        }}
      />
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded text-xs pointer-events-none">
        Click canvas if WASD stops working!
      </div>
      {/* Debug overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs p-3 rounded font-mono">
        <div>Keys: W:{debugInfo.keys.w?'✓':'✗'} A:{debugInfo.keys.a?'✓':'✗'} S:{debugInfo.keys.s?'✓':'✗'} D:{debugInfo.keys.d?'✓':'✗'}</div>
        <div>Pos: ({Math.round(debugInfo.pos.x || 0)}, {Math.round(debugInfo.pos.y || 0)})</div>
        <div>Other Users: {debugInfo.users}</div>
        <div className="mt-2 text-gray-300">Press WASD or Arrow keys to move</div>
      </div>
    </div>
  );
};

export default CosmosWorld;
