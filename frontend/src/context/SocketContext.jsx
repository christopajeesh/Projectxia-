import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  useEffect(() => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const rawApi = import.meta.env.VITE_API_URL || '';
    const fallbackHost = rawApi ? rawApi.replace(/\/api\/?$/, '') : (isLocal ? 'http://localhost:5000' : window.location.origin);
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || fallbackHost;

    const newSocket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[ProjectXia Socket] Connected with ID:', newSocket.id);
      if (user) {
        newSocket.emit('join_presence', user);
      }
    });

    newSocket.on('online_users_update', (usersList) => {
      setOnlineUsers(usersList);
    });

    newSocket.on('new_message_notification', (notif) => {
      setRealtimeNotification(notif);
      setTimeout(() => setRealtimeNotification(null), 6000);
    });

    return () => newSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        realtimeNotification,
        clearRealtimeNotification: () => setRealtimeNotification(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
