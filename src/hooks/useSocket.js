import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

/**
 * useSocket — subscribe to socket events with automatic cleanup.
 * @param {string} event  — Socket event name
 * @param {Function} handler — Event handler
 * @param {Array} deps — Dependencies (re-subscribes when changed)
 */
export const useSocketEvent = (event, handler, deps = []) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const cb = (...args) => handlerRef.current(...args);
    socket.on(event, cb);
    return () => socket.off(event, cb);
  }, [event, ...deps]);
};

/**
 * useTypingIndicator — manage typing state for a given chat
 */
export const useTypingIndicator = (chatId) => {
  const typingTimer = useRef(null);

  const startTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('typing:start', { chatId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:stop', { chatId });
    }, 2500);
  };

  const stopTyping = () => {
    clearTimeout(typingTimer.current);
    getSocket()?.emit('typing:stop', { chatId });
  };

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  return { startTyping, stopTyping };
};
