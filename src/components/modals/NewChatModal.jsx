import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import useUIStore from '@/store/uiStore';
import useChatStore from '@/store/chatStore';
import UserAvatar from '@/components/ui/UserAvatar';

const NewChatModal = () => {
  const { closeModal } = useUIStore();
  const { createDirectChat, setActiveChat } = useChatStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(null);

  const handleSearch = useCallback(async (value) => {
    setQuery(value);
    if (!value.trim()) { setResults([]); return; }
    setIsSearching(true);
    try {
      const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(value)}`);
      setResults(data.users || []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleStartChat = async (user) => {
    setIsCreating(user._id);
    try {
      const chat = await createDirectChat(user._id);
      await setActiveChat(chat);
      closeModal();
    } catch {
      toast.error('Failed to start conversation');
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-space-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <MessageSquare size={15} className="text-violet-400" />
            </div>
            <h2 className="text-white font-semibold text-sm">New Conversation</h2>
          </div>
          <button
            onClick={closeModal}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              autoFocus
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
            />
            {isSearching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          <AnimatePresence>
            {results.length === 0 && query.trim() && !isSearching && (
              <div className="px-5 py-8 text-center text-white/30 text-sm">
                No users found for "{query}"
              </div>
            )}
            {!query.trim() && (
              <div className="px-5 py-8 text-center text-white/30 text-sm">
                Search for a user to start a conversation
              </div>
            )}
            {results.map((user) => (
              <motion.button
                key={user._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleStartChat(user)}
                disabled={isCreating === user._id}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-colors text-left disabled:opacity-60"
              >
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{user.username}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
                {isCreating === user._id ? (
                  <Loader2 size={14} className="text-violet-400 animate-spin shrink-0" />
                ) : (
                  <span className="text-xs text-violet-400/60 shrink-0">Message</span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewChatModal;
