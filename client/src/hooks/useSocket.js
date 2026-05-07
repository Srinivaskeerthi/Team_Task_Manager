import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';

let socket = null;

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && user && !socket) {
      socket = io('/', { transports: ['websocket', 'polling'] });

      socket.on('connect', () => {
        socket.emit('user:online', user._id);
      });

      socket.on('notification', (data) => {
        addNotification(data);
      });
    }

    return () => {
      if (socket && !isAuthenticated) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [isAuthenticated, user]);

  const joinProject = useCallback((projectId) => {
    if (socket) socket.emit('project:join', projectId);
  }, []);

  const leaveProject = useCallback((projectId) => {
    if (socket) socket.emit('project:leave', projectId);
  }, []);

  return { socket, joinProject, leaveProject };
};

export const getSocket = () => socket;
