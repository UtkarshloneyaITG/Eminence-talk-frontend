import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, MagnifyingGlass, Phone, VideoCamera, DotsThreeVertical, PenNib, PushPin, ArrowLeft } from '@phosphor-icons/react';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserAvatar from '@/components/ui/UserAvatar';
import TypingIndicator from './TypingIndicator';

const ChatWindow = () => {
  const { activeChat, typingUsers } = useChatStore();
  const { toggleSidebar, sidebarOpen, setRightPanel, openCanvas } = useUIStore();
  const { user } = useAuthStore();

  if (!activeChat) return <EmptyState onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />;

  const isGroup = activeChat.type === 'group';
  const other = !isGroup ? activeChat.participants.find((p) => p._id !== user?._id) : null;
  const displayName = isGroup ? activeChat.group?.name : other?.username;
  const typing = typingUsers[activeChat._id] || [];

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] backdrop-blur-xl bg-white/[0.02] z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all ${sidebarOpen ? 'md:hidden' : ''}`}
          >
            <List size={18} weight="bold" />
          </button>
          <UserAvatar
            user={{ avatar: isGroup ? { url: activeChat.group?.avatar?.url } : other?.avatar, username: displayName }}
            size="sm"
            showStatus={!isGroup}
          />
          <button
            onClick={() => setRightPanel('profile')}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <p className="text-white font-semibold text-sm">{displayName}</p>
            <AnimatePresence mode="wait">
              {typing.length > 0 ? (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TypingIndicator users={typing} />
                </motion.div>
              ) : (
                <motion.p key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/40 text-xs">
                  {isGroup ? `${activeChat.participants.length} members` : other?.status || 'offline'}
                </motion.p>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <HeaderBtn icon={MagnifyingGlass} onClick={() => setRightPanel('search')} title="Search" />
          <HeaderBtn icon={PenNib} onClick={() => openCanvas(null)} title="Draw" />
          <HeaderBtn icon={PushPin} onClick={() => setRightPanel('pinned')} title="Pinned" />
          <HeaderBtn icon={DotsThreeVertical} onClick={() => setRightPanel('profile')} title="Info" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList chatId={activeChat._id} />
      </div>

      {/* Input */}
      <MessageInput chatId={activeChat._id} />
    </div>
  );
};

const HeaderBtn = ({ icon: Icon, onClick, title }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    title={title}
    className="p-2 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-all"
  >
    <Icon size={17} />
  </motion.button>
);

const EmptyState = ({ onToggleSidebar, sidebarOpen }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative">
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="w-24 h-24 rounded-3xl border border-white/[0.08] flex items-center justify-center mb-6"
      style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.12)' }}
    >
      <motion.div
        className="w-12 h-12 rounded-2xl"
        style={{ background: `linear-gradient(135deg, var(--accent), rgba(var(--accent-rgb), 0.6))` }}
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
    <h2 className="text-white/80 font-display text-xl font-bold mb-2">Eminence-Talk</h2>
    <p className="text-white/30 text-sm max-w-xs">Select a conversation or start a new one to begin chatting.</p>
    {!sidebarOpen && <button
      onClick={onToggleSidebar}
      className="mt-6 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all btn-accent-hover"
      style={{
        backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
        borderColor: 'rgba(var(--accent-rgb), 0.25)',
        color: 'var(--accent)',
      }}
    >
      Open sidebar
    </button>}

  </div>
);

export default ChatWindow;
