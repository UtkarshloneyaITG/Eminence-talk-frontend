import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import RightPanel from '@/components/chat/RightPanel';
import CanvasDrawing from '@/components/canvas/CanvasDrawing';
import ThreeBackground from '@/components/three/ThreeBackground';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import { getSocket } from '@/lib/socket';

const Chat = () => {
  const { addMessage, updateMessage, removeMessage, setTyping, setOnlineUsers, setUserStatus } = useChatStore();
  const { canvasActive, rightPanel } = useUIStore();
  const { user } = useAuthStore();

  // Bind global socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('message:new', ({ message }) => addMessage(message));
    socket.on('message:edited', ({ message }) => updateMessage(message._id, message));
    socket.on('message:deleted', ({ messageId }) => removeMessage(messageId));
    socket.on('message:reaction', ({ messageId, reactions }) => updateMessage(messageId, { reactions }));
    socket.on('typing:start', ({ chatId, user: typingUser }) => setTyping(chatId, typingUser, true));
    socket.on('typing:stop', ({ chatId, userId }) => setTyping(chatId, { _id: userId }, false));
    socket.on('users:online', setOnlineUsers);
    socket.on('user:status', ({ userId, status }) => setUserStatus(userId, status));

    return () => {
      socket.off('message:new');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('message:reaction');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('users:online');
      socket.off('user:status');
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-space-950 flex overflow-hidden relative">
      {/* Three.js background */}
      <ThreeBackground />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <ChatWindow />

        {/* Right panel (conditionally shown) */}
        <AnimatePresence>
          {rightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="border-l border-white/[0.06] overflow-hidden"
            >
              <RightPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Canvas overlay */}
      <AnimatePresence>
        {canvasActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-50"
          >
            <CanvasDrawing />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
