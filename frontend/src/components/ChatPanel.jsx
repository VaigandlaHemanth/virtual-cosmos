import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';

const ChatPanel = ({ connections }) => {
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on mount
    const saved = localStorage.getItem('cosmos-chat-messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const endOfMessagesRef = useRef(null);
  const listenerRegisteredRef = useRef(false);

  useEffect(() => {
    // Only register listener once
    if (!listenerRegisteredRef.current) {
      listenerRegisteredRef.current = true;
      
      socketService.onChatMessage((data) => {
        setMessages(prev => {
          // Check if message already exists (prevent duplicates)
          const isDuplicate = prev.some(
            msg => msg.userId === data.userId && 
                   msg.timestamp === data.timestamp && 
                   msg.message === data.message
          );
          
          if (isDuplicate) {
            return prev;
          }
          
          const newMessages = [...prev, data];
          // Save to localStorage
          localStorage.setItem('cosmos-chat-messages', JSON.stringify(newMessages));
          return newMessages;
        });
      });
    }
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      socketService.emitChatSend(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Proximity Chat</h3>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{connections.length} Nearby</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-10">Say hello to nearby users!</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={`${msg.userId}-${msg.timestamp}-${idx}`} className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">{msg.username}</span>
              <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none text-sm text-gray-800 break-words">
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
