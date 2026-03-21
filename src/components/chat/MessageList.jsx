import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
import MessageBubble from './MessageBubble';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

const MessageList = ({ chatId }) => {
  const { messages, fetchMessages, isLoadingMessages } = useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevScrollHeight = useRef(0);
  const hasMore = useRef(true);

  const chatMessages = messages[chatId] || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  // Infinite scroll (load older messages)
  const handleScroll = useCallback(async () => {
    if (!containerRef.current || isLoadingMessages || !hasMore.current) return;
    const { scrollTop } = containerRef.current;
    if (scrollTop < 80 && chatMessages.length > 0) {
      prevScrollHeight.current = containerRef.current.scrollHeight;
      const oldest = chatMessages[0]?.createdAt;
      const more = await fetchMessages(chatId, oldest);
      hasMore.current = more;

      // Maintain scroll position after prepending
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop =
            containerRef.current.scrollHeight - prevScrollHeight.current;
        }
      });
    }
  }, [chatId, isLoadingMessages, chatMessages]);

  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Group messages by date + consecutive sender
  const grouped = groupMessages(chatMessages);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden px-4 py-4 space-y-1 scrollbar-thin scroll-smooth"
    >
      {isLoadingMessages && chatMessages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <span className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(var(--accent-rgb), 0.25)', borderTopColor: 'var(--accent)' }} />
        </div>
      )}

      {isLoadingMessages && chatMessages.length > 0 && (
        <div className="flex justify-center py-2">
          <span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(var(--accent-rgb), 0.25)', borderTopColor: 'var(--accent)' }} />
        </div>
      )}

      <AnimatePresence initial={false}>
        {grouped.map((group) => (
          <div key={group.key}>
            {/* Date separator */}
            {group.showDate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 my-4"
              >
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-white/30 text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.05]">
                  {formatDateLabel(group.date)}
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </motion.div>
            )}

            <MessageBubble
              message={group.message}
              isSelf={group.message.sender?._id === user?._id}
              showAvatar={group.showAvatar}
              showName={group.showName}
            />
          </div>
        ))}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
};

function groupMessages(messages) {
  return messages.map((msg, i) => {
    const prev = messages[i - 1];
    const showDate = !prev || !isSameDay(new Date(msg.createdAt), new Date(prev.createdAt));
    const showAvatar = !prev || prev.sender?._id !== msg.sender?._id || showDate;
    const showName = showAvatar && messages.some((m) => m.sender?._id !== msg.sender?._id);

    return {
      key: msg._id,
      message: msg,
      showDate,
      showAvatar,
      showName,
      date: new Date(msg.createdAt),
    };
  });
}

function formatDateLabel(date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

export default MessageList;
