import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import socketService from '../services/socket';

const CONFIG = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  PROXIMITY_RADIUS: 150,
};

const POSITION_UPDATE_INTERVAL = 16;

// Avatars list
const AVATAR_IMAGES = ['/avatar1.png', '/avatar2.png', '/avatar3.png'];

// Assign random avatar to user (deterministic based on username)
const getAvatarForUser = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_IMAGES[Math.abs(hash) % AVATAR_IMAGES.length];
};

const CosmosWorld = ({ currentUsername, onMoveToUser }) => {
  const pixiContainer = useRef(null);
  const appRef = useRef(null);
  const usersMapRef = useRef(new Map());
  const myAvatarRef = useRef(null);
  const myPositionRef = useRef({ x: 600, y: 400 });
  const lastUpdateTimeRef = useRef(0);
  const lastDebugTimeRef = useRef(0);
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const [debugInfo, setDebugInfo] = useState({ keys: {}, pos: {}, users: 0 });
  const autoMoveTargetRef = useRef(null);
  const userAvatarsRef = useRef(new Map()); // Store username -> emoji mapping

  // Helper to draw avatars with image from API
  const createAvatarSprite = (app, username, color, showRadius) => {
    const container = new PIXI.Container();

    if (showRadius) {
      const radius = new PIXI.Graphics();
      radius.circle(0, 0, CONFIG.PROXIMITY_RADIUS);
      radius.fill({ color: 0xFFFFFF, alpha: 0.1 });
      container.addChild(radius);
    }

    // Get or assign avatar image URL
    let avatarUrl = userAvatarsRef.current.get(username);
    if (!avatarUrl) {
      avatarUrl = getAvatarForUser(username);
      userAvatarsRef.current.set(username, avatarUrl);
    }

    // Create Avatar Sprite (No initial size to prevent Infinity scale bug!)
    const avatarSprite = new PIXI.Sprite();
    avatarSprite.anchor.set(0.5);
    container.addChild(avatarSprite);

    // Load texture asynchronously. Local images won't trigger crossOrigin crash!
    PIXI.Assets.load(avatarUrl).then((texture) => {
      if (avatarSprite && !avatarSprite.destroyed) {
        avatarSprite.texture = texture;
        avatarSprite.width = 64;  
        avatarSprite.height = 64;

        // Add a circular mask to hide the square corners of the image
        const mask = new PIXI.Graphics();
        mask.circle(0, 0, 31); // slightly smaller than 32 to avoid edge bleeding
        mask.fill({ color: 0xFFFFFF });
        container.addChild(mask);
        avatarSprite.mask = mask;
      }
    }).catch(e => console.error('[CosmosWorld] ❌ Failed to load avatar', e));

    // Username label
    const text = new PIXI.Text({ 
      text: username, 
      style: { 
        fontSize: 14, 
        fill: 0xffffff, 
        align: 'center',
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 3 }
      }
    });
    text.anchor.set(0.5);
    text.position.y = -45;
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

  // Expose moveToUser function to parent
  useEffect(() => {
    if (onMoveToUser) {
      onMoveToUser.current = (targetUser) => {
        const targetSprite = usersMapRef.current.get(targetUser.userId);
        if (targetSprite) {
          const targetPos = targetSprite.position;
          // Calculate position just within proximity range
          const angle = Math.atan2(targetPos.y - myPositionRef.current.y, targetPos.x - myPositionRef.current.x);
          const distance = CONFIG.PROXIMITY_RADIUS - 30; // 30 pixels inside proximity range
          const targetX = targetPos.x - Math.cos(angle) * distance;
          const targetY = targetPos.y - Math.sin(angle) * distance;
          
          // Clamp to canvas boundaries
          const clampedX = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH, targetX));
          const clampedY = Math.max(0, Math.min(CONFIG.CANVAS_HEIGHT, targetY));
          
          autoMoveTargetRef.current = { x: clampedX, y: clampedY };
          console.log('[CosmosWorld] Auto-moving to user:', targetUser.username, 'at', { x: clampedX, y: clampedY });
        }
      };
    }
  }, [onMoveToUser]);

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

    // We will connect AFTER PixiJS is fully initialized so appRef is ready

    // Initialize Pixi Application AFTER listeners are registered
    const initPixi = async () => {
      const app = new PIXI.Application();
      await app.init({
        width: CONFIG.CANVAS_WIDTH,
        height: CONFIG.CANVAS_HEIGHT,
        backgroundColor: 0x8B7355, // Wooden brown color
        antialias: true,
      });

      if (!isMounted) {
        app.destroy(true, { children: true });
        return;
      }

      appRef.current = app;
      
      // Preload assets
      try {
        await PIXI.Assets.load(['/office_bg.png']);
      } catch (e) {
        console.error('Failed to load assets', e);
      }
      
      // Clean up previous canvas if React strict mode appended twice
      while (pixiContainer.current.firstChild) {
        pixiContainer.current.removeChild(pixiContainer.current.firstChild);
      }
      pixiContainer.current.appendChild(app.canvas);
      
      // Make canvas responsive
      app.canvas.style.maxWidth = '100%';
      app.canvas.style.maxHeight = '100%';
      app.canvas.style.objectFit = 'contain';

      // Add office background image
      const bgTexture = PIXI.Texture.from('/office_bg.png');
      const bgSprite = new PIXI.Sprite(bgTexture);
      bgSprite.width = CONFIG.CANVAS_WIDTH;
      bgSprite.height = CONFIG.CANVAS_HEIGHT;
      bgSprite.anchor.set(0);
      bgSprite.position.set(0, 0);

      // Make background clickable for point-and-click movement
      bgSprite.eventMode = 'static';
      bgSprite.on('pointerdown', (e) => {
        // e.global gives coordinate within Pixi's 1200x800 internal map
        autoMoveTargetRef.current = { x: e.global.x, y: e.global.y };
        console.log('[CosmosWorld] Point-and-click move to:', e.global.x, e.global.y);
      });

      app.stage.addChild(bgSprite);

      console.log('[CosmosWorld] PixiJS initialized for user:', currentUsername);

      // Connect to socket AFTER PixiJS is fully ready!
      socketService.connect(currentUsername);

      // Create my Avatar
      myAvatarRef.current = createAvatarSprite(app, currentUsername, 0x4CAF50, true);
      app.stage.addChild(myAvatarRef.current);
      myAvatarRef.current.position.set(myPositionRef.current.x, myPositionRef.current.y);

      // Game Loop
      app.ticker.add(() => {
        let moved = false;
        const speed = 5; // Increased speed for better user experience
        const pos = myPositionRef.current;

        // Handle auto-move to target
        if (autoMoveTargetRef.current) {
          const target = autoMoveTargetRef.current;
          const dx = target.x - pos.x;
          const dy = target.y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 5) {
            // Move towards target
            const moveSpeed = Math.min(speed * 2, distance);
            pos.x += (dx / distance) * moveSpeed;
            pos.y += (dy / distance) * moveSpeed;
            moved = true;
          } else {
            // Reached target
            autoMoveTargetRef.current = null;
            console.log('[CosmosWorld] Reached auto-move target');
          }
        } else {
          // Manual keyboard movement
          if (keysRef.current.w) { pos.y -= speed; moved = true; }
          if (keysRef.current.s) { pos.y += speed; moved = true; }
          if (keysRef.current.a) { pos.x -= speed; moved = true; }
          if (keysRef.current.d) { pos.x += speed; moved = true; }
        }

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
        onClick={() => pixiContainer.current?.focus()}
        className="shadow-lg border border-gray-200 rounded-lg overflow-hidden outline-none cursor-pointer flex justify-center items-center bg-gray-900" 
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
