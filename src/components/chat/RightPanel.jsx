import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useUIStore from '@/store/uiStore';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
import UserAvatar from '@/components/ui/UserAvatar';
import MessageBubble from './MessageBubble';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const RightPanel = () => {
  const { rightPanel, setRightPanel } = useUIStore();
  const { activeChat, searchMessages, searchResults, clearSearch } = useChatStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState([]);

  useEffect(() => {
    if (rightPanel === 'pinned' && activeChat) {
      api.get(`/api/chats/${activeChat._id}/pinned`).then(({ data }) => setPinnedMessages(data.pinnedMessages));
    }
  }, [rightPanel, activeChat]);

  const other = activeChat?.type === 'direct' ? activeChat.participants.find((p) => p._id !== user?._id) : null;

  return (
    <div className="h-full flex flex-col bg-white/[0.02]">
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <h3 className="text-white font-semibold text-sm capitalize">{rightPanel}</h3>
        <button onClick={() => setRightPanel(null)} className="text-white/40 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {rightPanel === 'profile' && (
          <div className="text-center">
            <UserAvatar user={other || activeChat?.group} size="xl" className="mx-auto mb-4" />
            <h2 className="text-white font-display font-bold text-lg">{other?.username || activeChat?.group?.name}</h2>
            <p className="text-white/40 text-sm mt-1">{other?.bio || activeChat?.group?.description}</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs ${other?.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-white/40'}`}>
                {other?.status || 'offline'}
              </span>
            </div>
          </div>
        )}

        {rightPanel === 'search' && (
          <div className="space-y-3">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeChat && e.target.value.length >= 2) searchMessages(activeChat._id, e.target.value);
                else clearSearch();
              }}
              placeholder="Search in this chat..."
              className="w-full bg-white/[0.06] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
            />
            <div className="space-y-2">
              {searchResults.map((msg) => (
                <div key={msg._id} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-white/40 text-xs mb-1">{msg.sender?.username}</p>
                  <p className="text-white/70 text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {rightPanel === 'pinned' && (
          <div className="space-y-3">
            {pinnedMessages.length === 0 && <p className="text-white/30 text-sm text-center pt-8">No pinned messages</p>}
            {pinnedMessages.map((msg) => (
              <div key={msg._id} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <p className="text-violet-400 text-xs mb-1">{msg.sender?.username}</p>
                <p className="text-white/70 text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
