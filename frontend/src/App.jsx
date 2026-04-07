import React, { useState, useEffect, useRef } from 'react';
import CosmosWorld from './components/CosmosWorld';
import ChatPanel from './components/ChatPanel';
import ConnectionStatus from './components/ConnectionStatus';
import socketService from './services/socket';

function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [connections, setConnections] = useState([]);
  const chatPanelRef = useRef(null);
  const moveToUserRef = useRef(null);

  useEffect(() => {
    if (joined) {
      socketService.onConnectionEstablished((data) => {
        setConnections(prev => {
          if (!prev.find(c => c.userId === data.userId)) {
            return [...prev, data];
          }
          return prev;
        });
      });

      socketService.onConnectionTerminated((data) => {
        setConnections(prev => prev.filter(c => c.userId !== data.userId));
      });
    }

    return () => {
      // Disconnect on unmount
      socketService.disconnect();
    };
  }, [joined]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // IMPORTANT: Don't connect here yet!
      // Let CosmosWorld register its listeners first
      setJoined(true);
    }
  };

  const handleUserClick = (user) => {
    console.log('[App] User clicked:', user);
    
    // Move to user's proximity
    if (moveToUserRef.current) {
      moveToUserRef.current(user);
    }
    
    // Focus chat input after a short delay
    setTimeout(() => {
      if (chatPanelRef.current && chatPanelRef.current.focusInput) {
        chatPanelRef.current.focusInput();
        console.log('[App] Chat input focused');
      }
    }, 300);
  };

  if (!joined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A]">
        <form onSubmit={handleJoin} className="bg-white p-8 rounded-xl shadow-2xl w-96 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Enter Virtual Cosmos</h1>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors">
            Join Lobby
          </button>
        </form>
      </div>
    );
  }

  const isChatVisible = connections.length > 0;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white">
      {/* Header */}
      <header className="h-14 bg-[#0F172A] flex items-center px-6 justify-between text-white border-b border-gray-800 z-20">
        <div className="font-semibold tracking-wide">Upskill Mafia MERN</div>
        <div className="flex space-x-6 text-sm text-gray-300 absolute left-1/2 transform -translate-x-1/2">
          <button className="text-white border-b-2 border-white pb-1">Space</button>
          <button className="hover:text-white transition-colors">Call</button>
        </div>
        <div className="text-sm font-medium">Logged in as {username}</div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <ConnectionStatus connections={connections} onUserClick={handleUserClick} />
        
        <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] relative flex flex-col overflow-hidden">
          <CosmosWorld currentUsername={username} onMoveToUser={moveToUserRef} />
        </div>

        {isChatVisible && (
          <ChatPanel ref={chatPanelRef} connections={connections} />
        )}
      </div>

      {/* Bottom Bar */}
      <footer className="h-16 bg-[#0F172A] flex items-center justify-center px-6 z-20">
        <button 
          onClick={() => window.location.reload()}
          className="ml-auto bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Leave
        </button>
      </footer>
    </div>
  );
}

export default App;
