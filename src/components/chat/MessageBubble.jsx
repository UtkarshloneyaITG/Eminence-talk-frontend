import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Edit2, Trash2, Pin, MoreHorizontal, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { messageAppear } from '@/animations/gsapConfig';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import { socketEmit } from '@/lib/socket';
import UserAvatar from '@/components/ui/UserAvatar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const EMOJI_QUICK = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const MessageBubble = ({ message, isSelf, showAvatar, showName }) => {
  const bubbleRef = useRef(null);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { setReplyingTo } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (bubbleRef.current) messageAppear(bubbleRef.current, isSelf);
  }, []);

  const handleReact = async (emoji) => {
    try {
      await socketEmit('message:react', { messageId: message._id, emoji });
    } catch {
      await api.post(`/api/messages/${message._id}/react`, { emoji });
    }
    setShowReactions(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return;
    try {
      await socketEmit('message:delete', { messageId: message._id });
    } catch {
      await api.delete(`/api/messages/${message._id}`);
      toast.success('Message deleted');
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    try {
      await socketEmit('message:edit', { messageId: message._id, content: editContent });
      setIsEditing(false);
    } catch {
      toast.error('Failed to edit message');
    }
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-1 px-2`}>
        <span className="text-white/20 text-xs italic px-3 py-2 rounded-xl border border-white/[0.04] bg-white/[0.02]">
          Message deleted
        </span>
      </div>
    );
  }

  return (
    <motion.div
      ref={bubbleRef}
      layout
      className={`flex items-end gap-2 mb-1 group ${isSelf ? 'flex-row-reverse' : 'flex-row'} px-2`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
    >
      {/* Avatar */}
      {showAvatar ? (
        <div className="mb-1 shrink-0">
          <UserAvatar user={message.sender} size="xs" />
        </div>
      ) : (
        <div className="w-7 shrink-0" />
      )}

      <div className={`flex flex-col max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
        {/* Sender name (group chats) */}
        {showName && !isSelf && (
          <span className="text-violet-400 text-xs font-medium mb-1 px-1">
            {message.sender?.username}
          </span>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className={`mb-1.5 px-3 py-2 rounded-lg border-l-2 border-violet-500 bg-white/[0.04] text-xs text-white/50 max-w-full ${isSelf ? 'text-right' : ''}`}>
            <span className="text-violet-400 font-medium">{message.replyTo.sender?.username}</span>
            <p className="truncate mt-0.5">{message.replyTo.content || `[${message.replyTo.type}]`}</p>
          </div>
        )}

        {/* Bubble */}
        <div className="relative">
          {isEditing ? (
            <div className="flex gap-2 items-end">
              <input
                autoFocus
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleEdit()}
                className="bg-white/[0.08] border border-violet-500/40 rounded-xl px-3 py-2 text-white text-sm focus:outline-none min-w-[160px]"
              />
              <div className="flex gap-1">
                <button onClick={handleEdit} className="text-xs text-violet-400 hover:text-violet-300 px-2 py-1 rounded-lg bg-violet-600/20">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded-lg bg-white/[0.04]">Cancel</button>
              </div>
            </div>
          ) : (
            <div
              className={`px-3.5 py-2.5 rounded-2xl ${isSelf
                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-neon'
                : 'bg-white/[0.07] border border-white/[0.08] text-white/90 rounded-bl-sm'
              }`}
            >
              {/* Image */}
              {message.type === 'image' && message.attachments?.[0] && (
                <img
                  src={message.attachments[0].url}
                  alt="attachment"
                  className="rounded-xl max-w-xs max-h-64 object-cover mb-1"
                  loading="lazy"
                />
              )}
              {/* Canvas drawing */}
              {message.type === 'canvas' && message.attachments?.[0] && (
                <div className="relative">
                  <img src={message.attachments[0].url} alt="canvas" className="rounded-xl max-w-xs border border-violet-500/20" />
                  <span className="absolute top-1.5 left-1.5 text-[10px] bg-violet-600/80 text-white px-1.5 py-0.5 rounded-md">Drawing</span>
                </div>
              )}
              {/* Text */}
              {message.content && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
              )}
              {message.isEdited && (
                <span className="text-[10px] opacity-50 mt-0.5 block">edited</span>
              )}
            </div>
          )}

          {/* Quick reactions bar */}
          <AnimatePresence>
            {showActions && !isEditing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className={`absolute ${isSelf ? 'right-0' : 'left-0'} -top-10 flex items-center gap-1 bg-space-800/95 backdrop-blur-xl border border-white/[0.1] rounded-xl px-2 py-1.5 z-10 shadow-glass`}
              >
                {EMOJI_QUICK.map((e) => (
                  <button key={e} onClick={() => handleReact(e)} className="text-base hover:scale-125 transition-transform">{e}</button>
                ))}
                <div className="w-px h-4 bg-white/[0.1] mx-0.5" />
                <button onClick={() => setReplyingTo(message)} className="p-1 text-white/40 hover:text-white/80 transition-colors"><Reply size={13} /></button>
                {isSelf && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="p-1 text-white/40 hover:text-white/80 transition-colors"><Edit2 size={13} /></button>
                    <button onClick={handleDelete} className="p-1 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions display */}
        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReact(r.emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                  r.users.includes(user?._id)
                    ? 'bg-violet-600/20 border-violet-500/40 text-white'
                    : 'bg-white/[0.05] border-white/[0.08] text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                {r.emoji} <span>{r.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp + Read receipts */}
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
          <span className="text-white/25 text-[10px]">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isSelf && (
            <span className="text-white/30">
              {message.readBy?.length > 1 ? <CheckCheck size={12} className="text-violet-400" /> : <Check size={12} />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
