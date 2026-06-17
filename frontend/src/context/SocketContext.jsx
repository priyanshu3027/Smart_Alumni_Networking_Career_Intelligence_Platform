import { io } from 'socket.io-client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      socketRef.current = io('http://localhost:5000', { transports: ['websocket'] });
      socketRef.current.emit('join', user._id);
      socketRef.current.on('onlineUsers', setOnlineUsers);
      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
