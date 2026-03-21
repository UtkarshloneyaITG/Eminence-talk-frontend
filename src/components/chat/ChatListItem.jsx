import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ChatCircle, Share, BellSlash, PushPin, Trash, CheckSquare, X } from '@phosphor-icons/react';
import useChatStore from '@/store/chatStore';
import UserAvatar from '@/components/ui/UserAvatar';
import useAuthStore from '@/store/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/lib/api';

const MENU_ITEMS = [
  { id: 'open',    icon: ChatCircle, label: 'Open chat'                },
  { id: 'forward', icon: Share,      label: 'Forward'                  },
  { id: 'mute',    icon: BellSlash,  label: 'Mute'                     },
  { id: 'pin',     icon: PushPin,    label: 'Pin'                      },
  { id: 'delete',  icon: Trash,      label: 'Delete chat', danger: true },
];

// ─── Bottom-sheet drawer ────────────────────────────────────────────────────
const ChatDrawer = ({ chat, displayName, displayAvatar, onClose, onOpen, onDeleteRequest }) => {
  // Close on ESC
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const handleAction = (id) => {
    onClose();
    switch (id) {
      case 'open':    onOpen(); break;
      case 'forward': toast('Forward coming soon', { icon: '📤' }); break;
      case 'mute':    toast('Muted', { icon: '🔕' }); break;
      case 'pin':     toast('Pinned', { icon: '📌' }); break;
      case 'delete':  onDeleteRequest(); break;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9990] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer slides up from the bottom of the sidebar */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-0 left-0 w-[300px] z-[9991] bg-surface-98 backdrop-blur-xl border-t border-white/[0.08] rounded-t-2xl shadow-2xl pb-safe"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Chat info header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
          <UserAvatar user={{ avatar: displayAvatar, username: displayName }} size="sm" />
          <span className="text-white font-semibold text-sm truncate flex-1">{displayName}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <X size={15} weight="bold" />
          </button>
        </div>

        {/* Actions */}
        <div className="py-2">
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleAction(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors text-left
                  ${item.danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-white/80 hover:bg-white/[0.05] hover:text-white'}
                  ${i !== 0 && item.danger ? 'border-t border-white/[0.06] mt-1' : ''}
                `}
              >
                <Icon size={18} weight={item.danger ? 'bold' : 'regular'} className={item.danger ? '' : 'text-white/40'} />
                {item.label}
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

// ─── Chat List Item ─────────────────────────────────────────────────────────
const ChatListItem = ({ chat, isActive, onClick, selectMode, isSelected, onToggleSelect, onLongPress }) => {
  const { user } = useAuthStore();
  const { onlineUsers, clearChat } = useChatStore();
  const [drawer, setDrawer] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const longPressTimer = useRef(null);

  const isGroup = chat.type === 'group';
  const otherParticipant = !isGroup ? chat.participants.find((p) => p._id !== user?._id) : null;
  const displayName   = isGroup ? chat.group?.name : otherParticipant?.username;
  const displayAvatar = isGroup ? { url: chat.group?.avatar?.url || '' } : otherParticipant?.avatar;
  const isOnline      = !isGroup && onlineUsers.has(otherParticipant?._id);

  const lastMsg = chat.lastMessage;
  const lastContent = lastMsg?.isDeleted
    ? 'Message deleted'
    : lastMsg?.type !== 'text'
    ? `${lastMsg?.type} attachment`
    : lastMsg?.content;

  // Long-press → select mode
  const startPress = useCallback((e) => {
    if (selectMode || e.button > 0) return;
    setPressing(true);
    longPressTimer.current = setTimeout(() => {
      setPressing(false);
      navigator.vibrate?.(50);
      onLongPress?.();
    }, 700);
  }, [selectMode, onLongPress]);

  const cancelPress = useCallback(() => {
    clearTimeout(longPressTimer.current);
    setPressing(false);
  }, []);

  const handleClick = () => {
    if (selectMode) { onToggleSelect(chat._id); return; }
    onClick(); // left click opens chat directly
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (selectMode) return;
    setDrawer(true);
  };

  const doDelete = async () => {
    setConfirmOpen(false);
    try {
      const { data } = await api.delete(`/api/chats/${chat._id}`);
      clearChat(chat._id, user._id, data.lastMessage ?? null);
      toast.success('Chat cleared');
    } catch {
      toast.error('Failed to clear chat');
    }
  };

  return (
    <>
      {/* Outer wrapper flush with panel edge */}
      <div className="relative px-2">

        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: pressing ? 0.97 : 1 }}
          transition={{ scale: { duration: 0.15 } }}
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onContextMenu={handleRightClick}
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          className={`chat-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 border ${
            isActive && !selectMode ? '' : 'border-transparent hover:bg-white/[0.05]'
          } ${isSelected ? 'bg-white/[0.06]' : ''} ${pressing ? 'ring-1 ring-white/20' : ''}`}
          style={isActive && !selectMode ? {
            backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
            borderColor: 'rgba(var(--accent-rgb), 0.25)',
          } : {}}
        >
          {/* Select checkbox */}
          {selectMode && (
            <div
              className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
              style={isSelected
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }
                : { borderColor: 'rgba(255,255,255,0.2)' }}
            >
              {isSelected && <CheckSquare size={12} weight="fill" className="text-white" />}
            </div>
          )}

          <UserAvatar
            user={{ avatar: displayAvatar, username: displayName }}
            size="md"
            showStatus={!isGroup && !selectMode}
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
        </motion.div>
      </div>

      {/* Bottom-sheet drawer */}
      <AnimatePresence>
        {drawer && (
          <ChatDrawer
            chat={chat}
            displayName={displayName}
            displayAvatar={displayAvatar}
            onClose={() => setDrawer(false)}
            onOpen={() => { setDrawer(false); onClick(); }}
            onDeleteRequest={() => { setDrawer(false); setConfirmOpen(true); }}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmOpen}
        title="Delete chat?"
        message="Your sent messages will be cleared. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default ChatListItem;
