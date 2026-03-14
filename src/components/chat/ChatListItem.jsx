import { motion } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import useChatStore from '@/store/chatStore';
import UserAvatar from '@/components/ui/UserAvatar';
import useAuthStore from '@/store/authStore';

const ChatListItem = ({ chat, isActive, onClick }) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useChatStore();

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

  return (
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
  );
};

export default ChatListItem;
