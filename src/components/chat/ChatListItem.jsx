import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ChatCircle, Share, BellSlash, PushPin, Trash } from '@phosphor-icons/react';
import useChatStore from '@/store/chatStore';
import UserAvatar from '@/components/ui/UserAvatar';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

const MENU_ITEMS = [
  { id: 'open',    icon: ChatCircle, label: 'Open chat'                },
  { id: 'forward', icon: Share,      label: 'Forward'                  },
  { id: 'mute',    icon: BellSlash,  label: 'Mute'                     },
  { id: 'pin',     icon: PushPin,    label: 'Pin'                      },
  { id: 'delete',  icon: Trash,      label: 'Delete chat', danger: true },
];

const ContextMenu = ({ x, y, chat, onClose, onOpen }) => {
  const menuRef = useRef(null);

  // Adjust position so menu doesn't overflow the viewport
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({
      x: x + rect.width > vw ? x - rect.width : x,
      y: y + rect.height > vh ? y - rect.height : y,
    });
  }, [x, y]);

  // Close on outside click / scroll / ESC
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', handler);
    document.addEventListener('scroll', onClose, true);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('scroll', onClose, true);
      document.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  const handleAction = async (id) => {
    onClose();
    switch (id) {
      case 'open':
        onOpen();
        break;
      case 'forward':
        toast('Forward coming soon', { icon: '📤' });
        break;
      case 'mute':
        toast('Muted', { icon: '🔕' });
        break;
      case 'pin':
        toast('Pinned', { icon: '📌' });
        break;
      case 'delete':
        try {
          await api.delete(`/api/chats/${chat._id}`);
          toast.success('Chat deleted');
          // remove from store
          useChatStore.setState((s) => ({
            chats: s.chats.filter((c) => c._id !== chat._id),
            activeChat: s.activeChat?._id === chat._id ? null : s.activeChat,
          }));
        } catch {
          toast.error('Failed to delete chat');
        }
        break;
    }
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12 }}
      style={{ position: 'fixed', top: pos.y, left: pos.x, zIndex: 9999 }}
      className="min-w-[170px] bg-space-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl py-1.5 overflow-hidden"
    >
      {MENU_ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleAction(item.id)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors text-left
              ${item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
              }
              ${i !== 0 && item.danger ? 'border-t border-white/[0.06] mt-1 pt-2' : ''}
            `}
          >
            <Icon size={15} className={item.danger ? '' : 'text-white/40'} />
            {item.label}
          </button>
        );
      })}
    </motion.div>
  );
};

const ChatListItem = ({ chat, isActive, onClick }) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useChatStore();
  const [menu, setMenu] = useState(null); // { x, y }

  const isGroup = chat.type === 'group';
  const otherParticipant = !isGroup
    ? chat.participants.find((p) => p._id !== user?._id)
    : null;

  const displayName = isGroup ? chat.group?.name : otherParticipant?.username;
  const displayAvatar = isGroup ? { url: chat.group?.avatar?.url || '' } : otherParticipant?.avatar;
  const isOnline = !isGroup && onlineUsers.has(otherParticipant?._id);

  const lastMsg = chat.lastMessage;
  const lastContent = lastMsg?.isDeleted
    ? 'Message deleted'
    : lastMsg?.type !== 'text'
    ? `${lastMsg?.type} attachment`
    : lastMsg?.content;

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  return (
    <>
      <motion.button
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`chat-item w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 relative group ${
          isActive
            ? 'bg-violet-600/15 border border-violet-500/20'
            : 'hover:bg-white/[0.05] border border-transparent'
        }`}
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="active-chat"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-violet-500 rounded-r-full"
          />
        )}

        <UserAvatar
          user={{ avatar: displayAvatar, username: displayName }}
          size="md"
          showStatus={!isGroup}
          isOnline={isOnline}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white font-medium text-sm truncate">{displayName}</span>
            {lastMsg && (
              <span className="text-white/30 text-[10px] shrink-0">
                {formatDistanceToNowStrict(new Date(lastMsg.createdAt), { addSuffix: false })}
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs truncate mt-0.5">
            {lastContent || 'No messages yet'}
          </p>
        </div>
      </motion.button>

      <AnimatePresence>
        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            chat={chat}
            onClose={closeMenu}
            onOpen={onClick}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatListItem;
