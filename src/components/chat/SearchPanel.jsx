import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, User, Users, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import useChatStore from '@/store/chatStore';
import useUIStore from '@/store/uiStore';
import UserAvatar from '@/components/ui/UserAvatar';

const SearchPanel = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchChats, setActiveChat } = useChatStore();
  const { openModal } = useUIStore();

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
      className="absolute inset-0 z-50 backdrop-blur-xl bg-space-950/90 flex flex-col"
    >
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
        <Search size={18} className="text-white/40" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="flex-1 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
        />
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && <div className="text-center py-8 text-white/30 text-sm">Searching...</div>}
        {!loading && users.map((u) => (
          <button key={u._id} onClick={() => startChat(u._id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-all group">
            <UserAvatar user={u} size="md" showStatus />
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">{u.username}</p>
              <p className="text-white/40 text-xs truncate">{u.bio || u.email}</p>
            </div>
            <ArrowRight size={14} className="text-white/20 group-hover:text-violet-400 transition-colors" />
          </button>
        ))}
        {!loading && query.length >= 2 && users.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">No users found</div>
        )}
      </div>

      <div className="p-4 border-t border-white/[0.06]">
        <button onClick={() => { openModal('newGroup'); onClose(); }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-400 text-sm font-medium transition-all">
          <Users size={15} />
          Create new group
        </button>
      </div>
    </motion.div>
  );
};

export default SearchPanel;
