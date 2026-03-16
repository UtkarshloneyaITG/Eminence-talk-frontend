import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io('https://eminence-talk-backend.onrender.com', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
  socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Typed emit with Promise wrapper
export const socketEmit = (event, data) =>
  new Promise((resolve, reject) => {
    if (!socket) return reject(new Error('Socket not connected'));
    socket.emit(event, data, (response) => {
      if (response?.error) reject(new Error(response.error));
      else resolve(response);
    });
  });
