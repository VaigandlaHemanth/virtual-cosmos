import React, { useState, useEffect } from 'react';
import socketService from '../services/socket';

const AVATAR_IMAGES = ['/avatar1.png', '/avatar2.png', '/avatar3.png'];

export const getAvatarForUser = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_IMAGES[Math.abs(hash) % AVATAR_IMAGES.length];
};

const ConnectionStatus = ({ connections, onUserClick }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socketService.onUsersList((users) => {
      setOnlineUsers(users);
    });

    socketService.onUserJoined((data) => {
      setOnlineUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socketService.onUserLeft((data) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });
  }, []);

  const handleUserClick = (user) => {
    // We now allow clicking out of range users to auto-move to them!
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <div className="w-64 bg-[#F9FAFB] border-r border-gray-200 h-full flex flex-col z-10">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Upskill Mafia MERN</h2>
        <p className="text-xs text-gray-500 mt-1">Virtual Cosmos</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Team ({onlineUsers.length})
        </h3>
        <ul className="space-y-3">
          {onlineUsers.map(u => {
            const isConnected = connections.some(c => c.userId === u.userId);
            const avatar = getAvatarForUser(u.username);
            return (
              <li 
                key={u.userId} 
                className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-blue-50 cursor-pointer"
                onClick={() => handleUserClick(u)}
                title={isConnected ? 'Proximity chat established' : 'Click to move to user'}
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                    <img src={avatar} alt={`${u.username} avatar`} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <span className={`text-sm font-medium truncate ${isConnected ? 'text-gray-900' : 'text-gray-600'}`}>{u.username}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ConnectionStatus;
