import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const TestChatroom = () => {
  const { testId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser();
    
    return () => {
      disconnectWebSocket();
    };
  }, [testId]);

  useEffect(() => {
    if (currentUser) {
      connectWebSocket();
    }
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUser = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/viewprofile/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (response.data) {
        setCurrentUser(response.data);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setCurrentUser({ name: 'Anonymous', is_authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (socketRef.current) {
      return;
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/tests/${testId}/chat/`;
    console.log('Connecting to WebSocket URL:', wsUrl);
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('Connected to chat');
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
  
  if (data.type === 'message_history') {
    console.log('Processing message history:', data.messages?.length || 0, 'messages');
    setMessages(data.messages || []);
    setLoadingHistory(false);
    console.log('Loading history set to false');
  } else if (data.type === 'message') {
    console.log('Processing new message:', data);
    setMessages(prev => [...prev, {
      id: data.id || Date.now() + Math.random(),
      message: data.message,
      username: data.username,
      timestamp: data.timestamp,
      type: 'message'
    }]);
  }
};

    socketRef.current.onclose = (event) => {
      console.log('Disconnected from chat', event.code, event.reason);
      setIsConnected(false);
      socketRef.current = null;
      
      setTimeout(() => {
        if (!socketRef.current && currentUser) {
          connectWebSocket();
        }
      }, 3000);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const sendMessage = () => {
    if (socketRef.current && 
        socketRef.current.readyState === WebSocket.OPEN && 
        newMessage.trim() &&
        currentUser) {
      
      socketRef.current.send(JSON.stringify({
        message: newMessage.trim(),
        username: currentUser.name || 'Anonymous'
      }));
      
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessage = (msg) => {
    const isCurrentUser = msg.username === currentUser?.name;
    
    return (
      <div key={msg.id} className={`message-container mb-7 ${isCurrentUser ? 'flex justify-end' : 'flex justify-start'}`}style={{ marginBottom: '12px' }}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}>
          {!isCurrentUser && (
            <div className="text-xs font-semibold mb-1 text-blue-600">
              {msg.username}
            </div>
          )}
          <div className="message-text">{msg.message}</div>
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {msg.timestamp}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading chatroom...</div>
      </div>
    );
  }

  return (
    <div className="test-chatroom-page min-h-screen  ">
      {/* Header */} 
      <h4 className="text-2xl font-bold mb-6 text-center pt-6">Team Chatroom</h4>
      
      <div className="bg-white shadow-sm border-b"> 

        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
              <Link 
                to={`/tests/${testId}`}
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Test
              </Link>
              <div class="dividerv"/>

              <div>
              <div class="dividerv"/>

                 
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Messages Area */}
          <div className="messages-container flex-1 overflow-y-auto p-6" style={{ height: 'calc(100% - 80px)' }}>
            {loadingHistory ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-lg">Loading chat history...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-lg mb-2">Welcome to the team chat!</p>
                <p className="text-sm">Start the conversation by sending a message below.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map(formatMessage)}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="input-area p-4 border-t bg-gray-50">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isConnected || !currentUser}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !newMessage.trim() || !currentUser}
                className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChatroom;