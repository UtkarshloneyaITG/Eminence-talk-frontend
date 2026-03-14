import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Search, Settings, Bell, Plus, LogOut, ChevronLeft } from 'lucide-react';
import { gsap, staggerIn } from '@/animations/gsapConfig';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import ChatListItem from './ChatListItem';
import UserAvatar from '@/components/ui/UserAvatar';
import SearchPanel from './SearchPanel';

const Sidebar = () => {
  const { chats, fetchChats, setActiveChat, activeChat } = useChatStore();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, openModal, toggleNotifications } = useUIStore();
  const [tab, setTab] = useState('chats'); // 'chats' | 'contacts'
  const [showSearch, setShowSearch] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (listRef.current && chats.length) {
      staggerIn(listRef.current.querySelectorAll('.chat-item'));
    }
  }, [chats.length, tab]);

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col h-full border-r border-white/[0.06] backdrop-blur-xl bg-white/[0.02] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="sm" showStatus />
              <div>
                <p className="text-white font-semibold text-sm">{user?.username}</p>
                <p className="text-white/40 text-xs">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleNotifications} className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all">
                <Bell size={16} />
              </button>
              <button onClick={() => openModal('settings')} className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all">
                <Settings size={16} />
              </button>
              <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all md:hidden">
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-white/[0.04]">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 text-sm hover:bg-white/[0.07] hover:text-white/50 transition-all"
            >
              <Search size={14} />
              Search conversations...
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mx-3 mt-3 mb-2 bg-white/[0.04] rounded-xl p-0.5">
            {[['chats', MessageSquare], ['contacts', Users]].map(([id, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${tab === id ? 'bg-violet-600 text-white shadow-neon' : 'text-white/40 hover:text-white/70'}`}
              >
                <Icon size={13} /> {id}
              </button>
            ))}
          </div>

          {/* New chat button */}
          <div className="px-3 pb-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openModal(tab === 'chats' ? 'newChat' : 'newGroup')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/[0.1] text-white/40 hover:text-white/70 hover:border-violet-500/40 hover:bg-violet-500/5 text-xs font-medium transition-all"
            >
              <Plus size={14} />
              {tab === 'chats' ? 'New conversation' : 'New group'}
            </motion.button>
          </div>

          {/* Chat list */}
          <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-0.5 scrollbar-thin">
            {chats.length === 0 ? (
              <div className="text-center text-white/30 text-sm pt-10">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
                <p>No conversations yet</p>
                <p className="text-xs mt-1 opacity-70">Start a new chat above</p>
              </div>
            ) : (
              chats.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  isActive={activeChat?._id === chat._id}
                  onClick={() => setActiveChat(chat)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/[0.06]">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </motion.aside>
      )}

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default Sidebar;
