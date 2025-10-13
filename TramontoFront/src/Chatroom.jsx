import React, { useState, useEffect,useRef } from 'react';
import { useParams } from 'react-router-dom';

export default function Chatroom() {
  const { testId } = useParams(); // Get the test ID from the URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      const connectWebSocket = () => {
        socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/tests/${testId}/chat/`);
  
        socketRef.current.onopen = () => {
          console.log('WebSocket connected');
        };
  
        socketRef.current.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason);
          // Attempt to reconnect after 5 seconds
          setTimeout(() => connectWebSocket(), 5000);
        };
  
        socketRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
  
        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          setMessages((prevMessages) => [...prevMessages, data]);
        };
      };
  
      connectWebSocket();
    }
  
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null; // Reset the reference
      }
    };
  }, [testId]);

const sendMessage = () => {
  console.log('Socket state:', socketRef.current); // Debugging
  console.log('Attempting to send message:', newMessage);

  if (socketRef.current && newMessage.trim() !== '') {
    console.log('Sending message:', newMessage);
    socketRef.current.send(JSON.stringify({ message: newMessage }));
    setNewMessage('');
  } else {
    console.log('Socket not connected or message is empty');
  }
};

  return (
    <div className="chatroom-page">
      <h2 className="text-2xl font-bold mb-4">Chatroom for Test {testId}</h2>
      <div className="messages border p-4 mb-4 h-96 overflow-y-scroll">
        {messages.map((msg, index) => (
          <div key={index} className="message mb-2">
            <strong>{msg.sender}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="input-area flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="border p-2 flex-grow"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 ml-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}