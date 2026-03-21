import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlass, X, Users, ArrowRight, UserPlus, Clock, ChatCircle, UserMinus } from '@phosphor-icons/react';
import api from '@/lib/api';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import useFriendStore from '@/store/friendStore';
import UserAvatar from '@/components/ui/UserAvatar';

const SearchPanel = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchChats, setActiveChat } = useChatStore();
  const { openModal } = useUIStore();
  const { user: me } = useAuthStore();
  const { sendFriendRequest, removeFriend, sentRequests, friendRequests } = useFriendStore();

  useEffect(() => {
    if (!query.trim() || query.length < 2) return setUsers([]);
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/users/search?q=${query}`);
        setUsers(data.users);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const startChat = async (userId) => {
    const { data } = await api.get(`/api/chats/direct/${userId}`);
    await fetchChats();
    setActiveChat(data.chat);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 backdrop-blur-xl bg-base-90 flex flex-col"
    >
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
        <MagnifyingGlass size={18} className="text-white/40" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="flex-1 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
        />
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X size={18} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && <div className="text-center py-8 text-white/30 text-sm">Searching...</div>}
        {!loading && users.map((u) => {
          const isContact = me?.contacts?.includes(u._id);
          const isPending = sentRequests.has(u._id) ||
            friendRequests.some((r) => r.from._id === u._id); // they sent to me too

          return (
            <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-all">
              <UserAvatar user={u} size="md" showStatus />
              <div className="flex-1 text-left min-w-0">
                <p className="text-white text-sm font-medium">{u.username}</p>
                <p className="text-white/40 text-xs truncate">{u.bio || u.email}</p>
              </div>

              {isContact ? (
                /* Already friends → Message + Remove */
                <div className="flex gap-1.5">
                  <button
                    onClick={() => startChat(u._id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.15)', color: 'var(--accent)' }}
                  >
                    <ChatCircle size={13} weight="fill" /> Message
                  </button>
                  <button
                    onClick={() => removeFriend(u._id)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                    title="Remove friend"
                  >
                    <UserMinus size={13} weight="bold" />
                  </button>
                </div>
              ) : isPending ? (
                /* Request sent / incoming */
                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/40 bg-white/[0.05] cursor-default">
                  <Clock size={13} /> Pending
                </span>
              ) : (
                /* No connection → send request */
                <button
                  onClick={() => sendFriendRequest(u._id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                  style={{ backgroundColor: 'var(--accent)', boxShadow: `0 0 10px rgba(var(--accent-rgb), 0.4)` }}
                >
                  <UserPlus size={13} weight="fill" /> Add
                </button>
              )}
            </div>
          );
        })}
        {!loading && query.length >= 2 && users.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">No users found</div>
        )}
      </div>

      <div className="p-4 border-t border-white/[0.06]">
        <button
          onClick={() => { openModal('newGroup'); onClose(); }}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all btn-accent-hover"
          style={{
            backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
            borderColor: 'rgba(var(--accent-rgb), 0.2)',
            color: 'var(--accent)',
          }}
        >
          <Users size={15} weight="fill" />
          Create new group
        </button>
      </div>
    </motion.div>
  );
};

export default SearchPanel;
