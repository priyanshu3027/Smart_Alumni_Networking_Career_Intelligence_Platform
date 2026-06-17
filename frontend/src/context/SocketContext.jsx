import { io } from 'socket.io-client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://smart-alumni-networking-career.onrender.com';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
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
