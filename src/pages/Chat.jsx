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
import useFriendStore from '@/store/friendStore';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

const Chat = () => {
  const { addMessage, updateMessage, removeMessage, removeChat, addChat, clearChat, setTyping, setOnlineUsers, setUserStatus, updateGroupInChat } = useChatStore();
  const { canvasActive, rightPanel } = useUIStore();
  const { user } = useAuthStore();
  const { addIncomingRequest, markRequestAccepted, fetchFriendRequests } = useFriendStore();

  // Load friend requests on mount
  useEffect(() => { fetchFriendRequests(); }, []);

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
    socket.on('chat:new', ({ chat }) => addChat(chat));
    socket.on('chat:removed', ({ chatId }) => removeChat(chatId));
    socket.on('chat:cleared', ({ chatId, deletedBy, lastMessage }) => clearChat(chatId, deletedBy, lastMessage));
    socket.on('group:updated', ({ chatId, update }) => updateGroupInChat(chatId, update));
    socket.on('group:memberAdded', () => { /* new member gets full chat via chat:new */ });
    socket.on('group:memberRemoved', ({ chatId, removedUserId }) => {
      // Remove the member from the local group members list
      const { chats } = useChatStore.getState();
      const chat = chats.find((c) => c._id === chatId);
      if (chat?.group?.members) {
        updateGroupInChat(chatId, {
          members: chat.group.members.filter(
            (m) => (m.user?._id ?? m.user) !== removedUserId
          ),
        });
      }
    });
    socket.on('group:roleChanged', ({ chatId, userId, role }) => {
      const { chats } = useChatStore.getState();
      const chat = chats.find((c) => c._id === chatId);
      if (chat?.group?.members) {
        updateGroupInChat(chatId, {
          members: chat.group.members.map((m) =>
            (m.user?._id ?? m.user) === userId ? { ...m, role } : m
          ),
        });
      }
    });

    // Friend request events
    socket.on('friend:request', ({ from }) => {
      addIncomingRequest(from);
      toast(`${from.username} sent you a friend request`, { icon: '👋' });
    });
    socket.on('friend:accepted', ({ by }) => {
      markRequestAccepted(by._id);
      toast.success(`${by.username} accepted your friend request!`);
    });

    return () => {
      socket.off('message:new');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('message:reaction');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('users:online');
      socket.off('user:status');
      socket.off('chat:new');
      socket.off('chat:removed');
      socket.off('chat:cleared');
      socket.off('group:updated');
      socket.off('group:memberAdded');
      socket.off('group:memberRemoved');
      socket.off('group:roleChanged');
      socket.off('friend:request');
      socket.off('friend:accepted');
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-base flex overflow-hidden relative">
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
